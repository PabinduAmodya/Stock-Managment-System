package com.StockManawgment.service;

import com.StockManawgment.entity.Product;
import com.StockManawgment.entity.Stock;
import com.StockManawgment.exception.BadRequestException;
import com.StockManawgment.exception.ResourceNotFoundException;
import com.StockManawgment.repository.ProductRepository;
import com.StockManawgment.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class StockService {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Stock addStock(Stock stock) {
        Product product = productRepository.findById(stock.getProduct().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setQuantity(product.getQuantity() + stock.getQuantityAdded());
        productRepository.save(product);
        stock.setType(Stock.StockType.PURCHASE);
        return stockRepository.save(stock);
    }

    public List<Stock> getAllStock() {
        return stockRepository.findAll();
    }

    public Stock getStockById(Long id) {
        return stockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock entry not found with id: " + id));
    }

    public List<Stock> getStockByProduct(Long productId) {
        return stockRepository.findByProductIdOrderByDateDesc(productId);
    }

    @Transactional
    public Stock adjustStock(Long productId, int adjustment, String note) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        int newQty = product.getQuantity() + adjustment;
        if (newQty < 0) throw new BadRequestException("Adjustment would result in negative stock quantity");
        product.setQuantity(newQty);
        productRepository.save(product);

        Stock stock = new Stock();
        stock.setProduct(product);
        stock.setQuantityAdded(adjustment);
        stock.setType(Stock.StockType.ADJUSTMENT);
        stock.setNote(note != null ? note : "Manual adjustment");
        return stockRepository.save(stock);
    }

    public void deleteStockEntry(Long id) {
        stockRepository.delete(getStockById(id));
    }

    public List<Stock> getStockHistory() {
        return stockRepository.findAll();
    }

    public List<Stock> getStockByType(Stock.StockType type) {
        return stockRepository.findByType(type);
    }
}
