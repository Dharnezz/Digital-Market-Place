package com.digitalmarketplace.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.digitalmarketplace.config.DataSourceUrlConfig.ParsedDatabaseUrl;
import org.junit.jupiter.api.Test;

class DataSourceUrlConfigTest {

    @Test
    void parsesPostgresUrlAndKeepsCredentialsOutOfTheUrl() {
        ParsedDatabaseUrl parsed = DataSourceUrlConfig.parse("postgres://user:secret@db.example.com:5432/marketplace");

        assertEquals("jdbc:postgresql://db.example.com:5432/marketplace", parsed.url());
        assertEquals("user", parsed.username());
        assertEquals("secret", parsed.password());
    }

    @Test
    void supportsPostgresqlScheme() {
        ParsedDatabaseUrl parsed = DataSourceUrlConfig.parse("postgresql://user:secret@db.example.com:5432/marketplace");

        assertEquals("jdbc:postgresql://db.example.com:5432/marketplace", parsed.url());
        assertEquals("user", parsed.username());
        assertEquals("secret", parsed.password());
    }

    @Test
    void appliesDefaultsForMissingPortAndDatabase() {
        ParsedDatabaseUrl parsed = DataSourceUrlConfig.parse("postgres://user:secret@db.example.com/marketplace");

        assertEquals("jdbc:postgresql://db.example.com:5432/marketplace", parsed.url());
        assertEquals("user", parsed.username());
        assertEquals("secret", parsed.password());

        ParsedDatabaseUrl noDatabase = DataSourceUrlConfig.parse("postgresql://user:secret@db.example.com:5433");
        assertEquals("jdbc:postgresql://db.example.com:5433/postgres", noDatabase.url());
    }

    @Test
    void handlesMissingPasswordAndDecodesPercentEncodedCredentials() {
        ParsedDatabaseUrl noPassword = DataSourceUrlConfig.parse("postgres://alice@db.example.com:5432/marketplace");
        assertEquals("alice", noPassword.username());
        assertEquals("", noPassword.password());

        ParsedDatabaseUrl encoded = DataSourceUrlConfig.parse("postgres://us%40er:p%40ss@db.example.com:5432/marketplace");
        assertEquals("us@er", encoded.username());
        assertEquals("p@ss", encoded.password());
    }

    @Test
    void keepsPasswordWithColonsIntact() {
        ParsedDatabaseUrl parsed = DataSourceUrlConfig.parse("postgres://user:p:a:ss@db.example.com:5432/marketplace");

        assertEquals("user", parsed.username());
        assertEquals("p:a:ss", parsed.password());
    }

    @Test
    void passesThroughAlreadyValidOrUnknownValuesWithoutCredentials() {
        ParsedDatabaseUrl jdbc = DataSourceUrlConfig.parse("jdbc:postgresql://db.example.com:5432/marketplace");
        assertEquals("jdbc:postgresql://db.example.com:5432/marketplace", jdbc.url());
        assertNull(jdbc.username());
        assertNull(jdbc.password());

        ParsedDatabaseUrl other = DataSourceUrlConfig.parse("not-a-url");
        assertEquals("not-a-url", other.url());
        assertNull(other.username());
        assertNull(other.password());
    }

    @Test
    void returnsNullPartsForBlankInput() {
        assertNull(DataSourceUrlConfig.parse(null).url());
        assertNull(DataSourceUrlConfig.parse("").url());
        assertNull(DataSourceUrlConfig.parse("   ").url());
    }
}