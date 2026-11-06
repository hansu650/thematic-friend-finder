package com.example.thematicfriend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ThematicFriendApplication {

    public static void main(String[] args) {
        var context = SpringApplication.run(ThematicFriendApplication.class, args);
        var environment = context.getEnvironment();
        String port = environment.getProperty("local.server.port", "8080");
        String host = environment.getProperty("server.address", "127.0.0.1");
        if (host.equals("0.0.0.0") || host.equals("::")) host = "127.0.0.1";
        if (host.contains(":")) host = "[" + host + "]";
        String protocol = environment.getProperty("server.ssl.enabled", Boolean.class, false) ? "https" : "http";
        System.out.printf("%nMingle is ready.%nOpen in your browser: %s://%s:%s/%n"
                + "Each teammate runs a separate local copy with a separate database.%n%n", protocol, host, port);
    }

}
