package com.digitalmarketplace.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import com.zaxxer.hikari.HikariDataSource;

@SpringJUnitConfig(DataSourceUrlDefaultPortIntegrationTest.TestConfig.class)
@TestPropertySource(properties = "DATABASE_URL=postgres://post:password@host/digitalmarketplace")
class DataSourceUrlDefaultPortIntegrationTest {

    @Configuration
    @Import(DataSourceUrlConfig.class)
    static class TestConfig {
    }

    @Autowired
    private DataSource dataSource;

    @Test
    void defaultsToPort5432WhenAbsent() {
        assertInstanceOf(HikariDataSource.class, dataSource);
        HikariDataSource hikari = (HikariDataSource) dataSource;

        String jdbcUrl = hikari.getJdbcUrl();
        System.out.println("DATABASE_URL=postgres://post:password@host/digitalmarketplace");
        System.out.println("Produced JDBC URL: " + jdbcUrl);

        assertEquals("jdbc:postgresql://host:5432/digitalmarketplace", jdbcUrl);
        assertEquals("post", hikari.getUsername());
        assertEquals("password", hikari.getPassword());
    }
}