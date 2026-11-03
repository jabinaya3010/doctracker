
package com.example.doctracker_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.doctracker_backend.entity.Document;

public interface DocumentRepository
        extends JpaRepository<Document, Long> {

    List<Document> findByNameContainingIgnoreCase(String name);
}
