package com.StockManawgment.repository;

import com.StockManawgment.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findBySupplierId(Long supplierId);
    List<Purchase> findByStatus(Purchase.PurchaseStatus status);
    List<Purchase> findByDateBetween(LocalDateTime start, LocalDateTime end);
}
