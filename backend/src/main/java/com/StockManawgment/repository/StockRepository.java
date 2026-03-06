package com.StockManawgment.repository;

import com.StockManawgment.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    List<Stock> findByProductId(Long productId);
    List<Stock> findByType(Stock.StockType type);
    List<Stock> findByProductIdOrderByDateDesc(Long productId);
}
