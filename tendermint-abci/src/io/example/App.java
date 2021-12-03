package io.example;

import jetbrains.exodus.env.Environment;
import jetbrains.exodus.env.Environments;

import java.io.IOException;

public class App {
    public static void main(String[] args) throws IOException, InterruptedException {
        try (Environment env = Environments.newInstance("tmp/storage")) {
            io.example.WSApp app = new io.example.WSApp(env);
            io.example.GrpcServer server = new io.example.GrpcServer(app, 26658);
            server.start();
            server.blockUntilShutdown();
        }
    }
}
