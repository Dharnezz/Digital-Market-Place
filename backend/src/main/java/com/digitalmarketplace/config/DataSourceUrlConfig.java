package com.digitalmarketplace.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import javax.sql.DataSource;

import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/**
 * Production datasource configuration for platform-provided DATABASE_URL values.
 *
 * <p>Cloud platforms (Render, Railway, Heroku, ...) expose the connection string as
 * {@code postgres://user:pass@host:port/db} or {@code postgresql://...}, but the
 * PostgreSQL JDBC driver accepts only {@code jdbc:postgresql://...}. This class activates
 * only when {@code DATABASE_URL} is set, parses it with {@link URI}, builds a JDBC URL
 * that never contains credentials ({@code jdbc:postgresql://host:port/db}), and extracts
 * username/password from the URI userinfo. Local development (no {@code DATABASE_URL}) is
 * untouched and keeps using the {@code spring.datasource.*} defaults in application.yml.
 */
@Configuration
@ConditionalOnExpression("'${DATABASE_URL:}' != ''")
public class DataSourceUrlConfig {

    private static final String SCHEME_POSTGRES = "postgres";
    private static final String SCHEME_POSTGRESQL = "postgresql";
    private static final int DEFAULT_POSTGRES_PORT = 5432;
    private static final String DEFAULT_DATABASE = "postgres";

    @Bean
    DataSource dataSource(Environment environment) {
        ParsedDatabaseUrl parsed = parse(environment.getProperty("DATABASE_URL"));
        String username = environment.getProperty("DB_USERNAME");
        String password = environment.getProperty("DB_PASSWORD");
        if (username == null && parsed.username() != null) {
            username = parsed.username();
        }
        if (password == null && parsed.password() != null) {
            password = parsed.password();
        }
        return DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url(parsed.url())
                .username(username == null ? "postgres" : username)
                .password(password == null ? "" : password)
                .build();
    }

    /**
     * Parses a raw {@code DATABASE_URL} into the parts needed to build a DataSource.
     *
     * <p>{@code postgres://...} and {@code postgresql://...} produce a JDBC URL of the form
     * {@code jdbc:postgresql://host:port/db} (credentials kept out of the URL) with the
     * username/password extracted from the URI userinfo. Any other value is passed through
     * unchanged. Returns {@code null} parts for blank or non-postgres input.
     */
    static ParsedDatabaseUrl parse(String databaseUrl) {
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return new ParsedDatabaseUrl(null, null, null);
        }
        String value = databaseUrl.trim();
        try {
            URI uri = URI.create(value);
            String scheme = uri.getScheme();
            if ((SCHEME_POSTGRES.equals(scheme) || SCHEME_POSTGRESQL.equals(scheme)) && uri.getHost() != null) {
                return new ParsedDatabaseUrl(
                        "jdbc:postgresql://" + host(uri) + ":" + port(uri) + "/" + database(uri),
                        username(uri),
                        password(uri));
            }
        } catch (IllegalArgumentException ex) {
            // Not a parseable URI; fall through to passthrough.
        }
        return new ParsedDatabaseUrl(value, null, null);
    }

    private static String host(URI uri) {
        String host = uri.getHost();
        return host.indexOf(':') >= 0 ? "[" + host + "]" : host;
    }

    private static int port(URI uri) {
        int port = uri.getPort();
        return port > 0 ? port : DEFAULT_POSTGRES_PORT;
    }

    private static String database(URI uri) {
        String path = uri.getPath();
        if (path == null || path.isBlank() || "/".equals(path)) {
            return DEFAULT_DATABASE;
        }
        return path.startsWith("/") ? path.substring(1) : path;
    }

    private static String username(URI uri) {
        String userInfo = uri.getUserInfo();
        if (userInfo == null) {
            return null;
        }
        int colon = userInfo.indexOf(':');
        return colon < 0 ? decode(userInfo) : decode(userInfo.substring(0, colon));
    }

    private static String password(URI uri) {
        String userInfo = uri.getUserInfo();
        if (userInfo == null) {
            return null;
        }
        int colon = userInfo.indexOf(':');
        return colon < 0 ? "" : decode(userInfo.substring(colon + 1));
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

    record ParsedDatabaseUrl(String url, String username, String password) {
    }
}