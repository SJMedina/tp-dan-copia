package edu.utn.frsf.isi.dan.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeScreenController {

    @GetMapping("/")
    public ResponseEntity<String> home() {
        return ResponseEntity.ok("El sistema está corriendo correctamente.");
    }
}