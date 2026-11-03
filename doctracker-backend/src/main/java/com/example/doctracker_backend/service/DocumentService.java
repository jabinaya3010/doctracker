
package com.example.doctracker_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.doctracker_backend.entity.Document;
import com.example.doctracker_backend.repository.DocumentRepository;

@Service
public class DocumentService {

    private final DocumentRepository repository;

    public DocumentService(DocumentRepository repository) {
        this.repository = repository;
    }

    public Document addDocument(Document document) {
        document.setId(null);
        return repository.save(document);
    }

    public List<Document> getAllDocuments() {
        return repository.findAll();
    }

    public Document getDocumentById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Document not found with ID: " + id
                        )
                );
    }

    public Document updateDocument(
            Long id, Document updatedDocument) {

        Document existing = getDocumentById(id);

        existing.setName(updatedDocument.getName());
        existing.setCategory(updatedDocument.getCategory());
        existing.setDocumentNumber(
                updatedDocument.getDocumentNumber()
        );
        existing.setIssueDate(updatedDocument.getIssueDate());
        existing.setExpiryDate(updatedDocument.getExpiryDate());
        existing.setNotes(updatedDocument.getNotes());

        return repository.save(existing);
    }

    public void deleteDocument(Long id) {
        Document document = getDocumentById(id);
        repository.delete(document);
    }

    public List<Document> searchDocuments(String name) {
        return repository.findByNameContainingIgnoreCase(name);
    }
}
