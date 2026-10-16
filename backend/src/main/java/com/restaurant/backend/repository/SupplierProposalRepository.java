package com.restaurant.backend.repository;

import com.restaurant.backend.entity.SupplierProposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupplierProposalRepository extends JpaRepository<SupplierProposal, Long> {
    List<SupplierProposal> findByStatus(String status);
    List<SupplierProposal> findBySupplierName(String supplierName);
}