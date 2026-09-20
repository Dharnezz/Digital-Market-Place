package com.digitalmarketplace.config;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import javax.sql.DataSource;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/**
 * Production datasource configuration for platform-provided DATABASE_URL values.
 *
 * <p>Cloud platforms (Render, Railway, Heroku, ...) expose the connection string as
 * {@code postgres://user:pass@host:port/db} or {@code postgresql://...}, but the
 * PostgreSQL JDBC driver only accepts {@code jdbc:postgresql://...}. This class
 * activates only when {@code DATABASE_URL} is set, normalizes the scheme, and builds
 * the DataSource from it. Local development (no {@code DATABASE_URL}) is untouched
 * and keeps using the {@code spring.datasource.*} defaults in application.yml.
 */
@Configuration
@ConditionalOnProperty(name = "DATABASE_URL")
public class DataSourceUrlConfig {

    private static final String POSTGRES_SCHEME = "postgres://";
    private static final String POSTGRESQL_SCHEME = "postgresql://";
    private static final String JDBC_POSTGRESQL_SCHEME = "jdbc:postgresql://";

    @Bean
    DataSource dataSource(Environment environment) {
        String jdbcUrl = toJdbcUrl(environment.getProperty("DATABASE_URL"));
        DataSourceBuilder<?> builder = DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url(jdbcUrl);

        UserInfo userInfo = userInfo(jdbcUrl);
        String username = environment.getProperty("DB_USERNAME");
        String password = environment.getProperty("DB_PASSWORD");

        if (username == null && userInfo != null) {
            username = userInfo.username();
        }
        if (password == null && userInfo != null) {
            password = userInfo.password();
        }
        if (username == null) {
            username = "postgres";
        }
        password = password == null ? "" : password;

        return builder.username(username).password(password).build();
    }

    /**
     * Converts a raw DATABASE_URL into a JDBC URL. {@code postgres://...} and
     * {@code postgresql://...} become {@code jdbc:postgresql://...}. Any other value
     * (including an already-valid JDBC URL) is returned unchanged.
     */
    static String toJdbcUrl(String databaseUrl) {
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return databaseUrl;
        }
        String url = databaseUrl.trim();
        if (url.startsWith(POSTGRES_SCHEME)) {
            return JDBC_POSTGRESQL_SCHEME + url.substring(POSTGRES_SCHEME.length());
        }
        if (url.startsWith(POSTGRESQL_SCHEME)) {
            return JDBC_POSTGRESQL_SCHEME + url.substring(POSTGRESQL_SCHEME.length());
        }
        return url;
    }

    /** Extracts {@code user[:password]} from the URL authority, decoding percent-encoding. */
    private static UserInfo userInfo(String jdbcUrl) {
        if (jdbcUrl == null) {
            return null;
        }
        int schemeEnd = jdbcUrl.indexOf("://");
        if (schemeEnd < 0) {
            return null;
        }
        int authorityStart = schemeEnd + 3;
        int authorityEnd = jdbcUrl.indexOf('/', authorityStart);
        if (authorityEnd < 0) {
            authorityEnd = jdbcUrl.length();
        }
        String authority = jdbcUrl.substring(authorityStart, authorityEnd);
        int at = authority.lastIndexOf('@');
        if (at < 0) {
            return null;
        }
        String rawUserInfo = authority.substring(0, at);
        int colon = rawUserInfo.indexOf(':');
        if (colon < 0) {
            return new UserInfo(decode(rawUserInfo), "");
        }
        return new UserInfo(decode(rawUserInfo.substring(0, colon)), decode(rawUserInfo.substring(colon + 1)));
    }

    private static String decode(String value) {
        if (value.indexOf('%') < 0) {
            return value;
        }
        try {
            return URLDecoder.decode(value, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            return value;
        }
    }

    private record UserInfo(String username, String password) {
    }
}