package com.StockManawgment.service;

import com.StockManawgment.entity.Product;
import com.StockManawgment.entity.Purchase;
import com.StockManawgment.entity.PurchaseItem;
import com.StockManawgment.entity.Stock;
import com.StockManawgment.exception.BadRequestException;
import com.StockManawgment.exception.ResourceNotFoundException;
import com.StockManawgment.repository.ProductRepository;
import com.StockManawgment.repository.PurchaseItemRepository;
import com.StockManawgment.repository.PurchaseRepository;
import com.StockManawgment.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private PurchaseItemRepository purchaseItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockRepository stockRepository;

    @Transactional
    public Purchase createPurchase(Purchase purchase, List<PurchaseItem> items) {
        purchase.setStatus(Purchase.PurchaseStatus.PENDING);
        Purchase savedPurchase = purchaseRepository.save(purchase);

        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseItem item : items) {
            item.setPurchase(savedPurchase);
            // auto-calculate totalPrice if not provided
            if (item.getTotalPrice() == null && item.getUnitPrice() != null) {
                item.setTotalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
            purchaseItemRepository.save(item);
            total = total.add(item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO);
        }
        savedPurchase.setTotalAmount(total);
        return purchaseRepository.save(savedPurchase);
    }

    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    public Purchase getPurchaseById(Long id) {
        return purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
    }

    public Purchase updatePurchase(Long id, Purchase purchaseDetails) {
        Purchase purchase = getPurchaseById(id);
        if (purchase.getStatus() != Purchase.PurchaseStatus.PENDING) {
            throw new BadRequestException("Only PENDING purchases can be updated");
        }
        purchase.setTotalAmount(purchaseDetails.getTotalAmount());
        purchase.setSupplier(purchaseDetails.getSupplier());
        return purchaseRepository.save(purchase);
    }

    public void deletePurchase(Long id) {
        Purchase purchase = getPurchaseById(id);
        if (purchase.getStatus() == Purchase.PurchaseStatus.APPROVED) {
            throw new BadRequestException("Cannot delete an approved purchase");
        }
        purchaseRepository.delete(purchase);
    }

    @Transactional
    public Purchase approvePurchase(Long id) {
        Purchase purchase = getPurchaseById(id);
        if (purchase.getStatus() != Purchase.PurchaseStatus.PENDING) {
            throw new BadRequestException("Purchase is already " + purchase.getStatus());
        }
        purchase.setStatus(Purchase.PurchaseStatus.APPROVED);
        purchaseRepository.save(purchase);

        List<PurchaseItem> items = purchaseItemRepository.findByPurchaseId(id);
        for (PurchaseItem item : items) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            productRepository.save(product);

            Stock stock = new Stock();
            stock.setProduct(product);
            stock.setQuantityAdded(item.getQuantity());
            stock.setType(Stock.StockType.PURCHASE);
            stock.setNote("GRN Purchase #" + id);
            stockRepository.save(stock);
        }
        return purchase;
    }

    public Purchase rejectPurchase(Long id) {
        Purchase purchase = getPurchaseById(id);
        if (purchase.getStatus() != Purchase.PurchaseStatus.PENDING) {
            throw new BadRequestException("Only PENDING purchases can be rejected");
        }
        purchase.setStatus(Purchase.PurchaseStatus.REJECTED);
        return purchaseRepository.save(purchase);
    }

    public List<PurchaseItem> getPurchaseItems(Long purchaseId) {
        return purchaseItemRepository.findByPurchaseId(purchaseId);
    }

    public List<Purchase> getPurchasesBySupplier(Long supplierId) {
        return purchaseRepository.findBySupplierId(supplierId);
    }

    public List<Purchase> getPurchasesByStatus(Purchase.PurchaseStatus status) {
        return purchaseRepository.findByStatus(status);
    }
}