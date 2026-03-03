package com.StockManawgment.Stock_Managment.controller;

import com.StockManawgment.Stock_Managment.dto.SaleRequest;
import com.StockManawgment.Stock_Managment.entity.SaleItem;
import com.StockManawgment.Stock_Managment.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*")
public class SaleController {

    @Autowired
    private SaleService saleService;

    // POST /api/sales/create - Create Sale
    // Body: { "sale": { "customerName":"...", "paymentMethod":"CASH" }, "items": [...] }
    @PostMapping("/create")
    public ResponseEntity<Sale> createSale(@RequestBody SaleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(saleService.createSale(request.getSale(), request.getItems()));
    }

    // GET /api/sales - View All Sales
    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    // GET /api/sales/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Sale> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getSaleById(id));
    }

    // PUT /api/sales/{id} - Update Sale
    @PutMapping("/{id}")
    public ResponseEntity<Sale> updateSale(@PathVariable Long id, @RequestBody Sale sale) {
        return ResponseEntity.ok(saleService.updateSale(id, sale));
    }

    // DELETE /api/sales/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSale(@PathVariable Long id) {
        saleService.deleteSale(id);
        return ResponseEntity.ok("Sale deleted successfully");
    }

    // GET /api/sales/{id}/items - View Sale Items
    @GetMapping("/{id}/items")
    public ResponseEntity<List<SaleItem>> getSaleItems(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getSaleItems(id));
    }

    // GET /api/sales/{id}/invoice - Generate Invoice
    @GetMapping("/{id}/invoice")
    public ResponseEntity<Sale> generateInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.generateInvoice(id));
    }

    // GET /api/sales/customer/{customerId}
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Sale>> getSalesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(saleService.getSalesByCustomer(customerId));
    }
}
