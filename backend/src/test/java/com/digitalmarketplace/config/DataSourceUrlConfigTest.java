package com.digitalmarketplace.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class DataSourceUrlConfigTest {

    @Test
    void convertsPlatformDatabaseUrlsToJdbcFormat() {
        assertEquals(
                "jdbc:postgresql://user:secret@db.example.com:5432/marketplace",
                DataSourceUrlConfig.toJdbcUrl("postgres://user:secret@db.example.com:5432/marketplace"));
        assertEquals(
                "jdbc:postgresql://user:secret@db.example.com:5432/marketplace",
                DataSourceUrlConfig.toJdbcUrl("postgresql://user:secret@db.example.com:5432/marketplace"));
        assertEquals(
                "jdbc:postgresql://db.example.com/marketplace",
                DataSourceUrlConfig.toJdbcUrl("postgres://db.example.com/marketplace"));
    }

    @Test
    void leavesAlreadyValidJdbcUrlsUntouched() {
        assertEquals(
                "jdbc:postgresql://user:secret@db.example.com:5432/marketplace",
                DataSourceUrlConfig.toJdbcUrl("jdbc:postgresql://user:secret@db.example.com:5432/marketplace"));
    }

    @Test
    void leavesOtherSchemesAndMalformedValuesUntouched() {
        assertEquals("jdbc:mariadb://host/db", DataSourceUrlConfig.toJdbcUrl("jdbc:mariadb://host/db"));
        assertEquals("not-a-url", DataSourceUrlConfig.toJdbcUrl("not-a-url"));
        assertEquals("", DataSourceUrlConfig.toJdbcUrl(""));
        assertEquals("   ", DataSourceUrlConfig.toJdbcUrl("   "));
        assertNull(DataSourceUrlConfig.toJdbcUrl(null));
    }
}