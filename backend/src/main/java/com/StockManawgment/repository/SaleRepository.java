package com.StockManawgment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.StockManawgment.entity.Sale;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByDateBetween(LocalDateTime start, LocalDateTime end);
    List<Sale> findByCustomerId(Long customerId);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.date BETWEEN :start AND :end")
    BigDecimal getTotalSalesAmount(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
