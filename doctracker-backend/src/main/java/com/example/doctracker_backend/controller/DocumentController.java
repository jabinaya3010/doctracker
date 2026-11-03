
package com.example.doctracker_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.doctracker_backend.entity.Document;
import com.example.doctracker_backend.service.DocumentService;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = {"http://localhost:5173" ,"https://document-tracker-liart.vercel.app"})
public class DocumentController {

    private final DocumentService service;

    public DocumentController(DocumentService service) {
        this.service = service;
    }

    // POST: Add document
    @PostMapping
    public ResponseEntity<Document> addDocument(
            @RequestBody Document document) {

        Document saved = service.addDocument(document);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    // GET: Get all documents
    @GetMapping
    public List<Document> getAllDocuments(
            @RequestParam(required = false) String name) {

        if (name != null && !name.isBlank()) {
            return service.searchDocuments(name);
        }

        return service.getAllDocuments();
    }

    // GET: Get document by ID
    @GetMapping("/{id}")
    public Document getDocumentById(@PathVariable Long id) {
        return service.getDocumentById(id);
    }

    // PUT: Update document
    @PutMapping("/{id}")
    public Document updateDocument(
            @PathVariable Long id,
            @RequestBody Document document) {

        return service.updateDocument(id, document);
    }

    // DELETE: Delete document
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id) {

        service.deleteDocument(id);

        return ResponseEntity.noContent().build();
    }
}
