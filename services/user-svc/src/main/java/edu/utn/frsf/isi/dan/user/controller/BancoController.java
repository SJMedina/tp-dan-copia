package edu.utn.frsf.isi.dan.user.controller;

import edu.utn.frsf.isi.dan.user.model.Banco;
import edu.utn.frsf.isi.dan.user.dao.BancoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bancos")
public class BancoController {

    private final BancoRepository bancoRepository;

    public BancoController(BancoRepository bancoRepository) {
        this.bancoRepository = bancoRepository;
    }

    @GetMapping
    public List<Banco> listarBancos() {
        return bancoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banco> obtenerBanco(@PathVariable Integer id) {
        return bancoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Banco> crearBanco(@RequestBody Banco banco) {
        Banco nuevoBanco = bancoRepository.save(banco);
        return ResponseEntity.ok(nuevoBanco);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banco> actualizarBanco(@PathVariable Integer id, @RequestBody Banco datos) {
        return bancoRepository.findById(id)
                .map(banco -> {
                    banco.setNombre(datos.getNombre());
                    banco.setCbu(datos.getCbu());
                    return ResponseEntity.ok(bancoRepository.save(banco));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrarBanco(@PathVariable Integer id) {
        if (!bancoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bancoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}