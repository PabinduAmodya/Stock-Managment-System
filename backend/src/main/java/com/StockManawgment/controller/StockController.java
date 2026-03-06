package com.StockManawgment.controller;

import com.StockManawgment.dto.StockAdjustRequest;
import com.StockManawgment.entity.Stock;
import com.StockManawgment.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "*")
public class StockController {

    @Autowired
    private StockService stockService;

    // POST /api/stocks - Add Stock
    @PostMapping
    public ResponseEntity<Stock> addStock(@RequestBody Stock stock) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockService.addStock(stock));
    }

    // GET /api/stocks - View All Stock
    @GetMapping
    public ResponseEntity<List<Stock>> getAllStock() {
        return ResponseEntity.ok(stockService.getAllStock());
    }

    // GET /api/stocks/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Stock> getStockById(@PathVariable Long id) {
        return ResponseEntity.ok(stockService.getStockById(id));
    }

    // GET /api/stocks/product/{productId} - View stock history for product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Stock>> getStockByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(stockService.getStockByProduct(productId));
    }

    // POST /api/stocks/adjust/{productId} - Stock Adjustment
    @PostMapping("/adjust/{productId}")
    public ResponseEntity<Stock> adjustStock(@PathVariable Long productId,
                                             @RequestBody StockAdjustRequest request) {
        return ResponseEntity.ok(stockService.adjustStock(productId, request.getAdjustment(), request.getNote()));
    }

    // DELETE /api/stocks/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStockEntry(@PathVariable Long id) {
        stockService.deleteStockEntry(id);
        return ResponseEntity.ok("Stock entry deleted successfully");
    }

    // GET /api/stocks/history - View Stock History
    @GetMapping("/history")
    public ResponseEntity<List<Stock>> getStockHistory() {
        return ResponseEntity.ok(stockService.getStockHistory());
    }
}
