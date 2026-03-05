package com.StockManawgment.controller;

import com.StockManawgment.dto.PurchaseRequest;
import com.StockManawgment.entity.Purchase;
import com.StockManawgment.entity.PurchaseItem;
import com.StockManawgment.service.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin(origins = "*")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    // POST /api/purchases/create - Create Purchase (GRN)
    // Body: { "purchase": { "supplier": {"id":1} }, "items": [...] }
    @PostMapping("/create")
    public ResponseEntity<Purchase> createPurchase(@RequestBody PurchaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(purchaseService.createPurchase(request.getPurchase(), request.getItems()));
    }

    // GET /api/purchases - View All Purchases
    @GetMapping
    public ResponseEntity<List<Purchase>> getAllPurchases() {
        return ResponseEntity.ok(purchaseService.getAllPurchases());
    }

    // GET /api/purchases/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Purchase> getPurchaseById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.getPurchaseById(id));
    }

    // PUT /api/purchases/{id} - Update Purchase
    @PutMapping("/{id}")
    public ResponseEntity<Purchase> updatePurchase(@PathVariable Long id, @RequestBody Purchase purchase) {
        return ResponseEntity.ok(purchaseService.updatePurchase(id, purchase));
    }

    // DELETE /api/purchases/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePurchase(@PathVariable Long id) {
        purchaseService.deletePurchase(id);
        return ResponseEntity.ok("Purchase deleted successfully");
    }

    // PATCH /api/purchases/{id}/approve - Approve Purchase
    @PatchMapping("/{id}/approve")
    public ResponseEntity<Purchase> approvePurchase(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.approvePurchase(id));
    }

    // PATCH /api/purchases/{id}/reject - Reject Purchase
    @PatchMapping("/{id}/reject")
    public ResponseEntity<Purchase> rejectPurchase(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.rejectPurchase(id));
    }

    // GET /api/purchases/{id}/items - View Purchase Items
    @GetMapping("/{id}/items")
    public ResponseEntity<List<PurchaseItem>> getPurchaseItems(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.getPurchaseItems(id));
    }

    // GET /api/purchases/supplier/{supplierId}
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<Purchase>> getPurchasesBySupplier(@PathVariable Long supplierId) {
        return ResponseEntity.ok(purchaseService.getPurchasesBySupplier(supplierId));
    }

    // GET /api/purchases/status/{status}
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Purchase>> getPurchasesByStatus(@PathVariable Purchase.PurchaseStatus status) {
        return ResponseEntity.ok(purchaseService.getPurchasesByStatus(status));
    }
}
