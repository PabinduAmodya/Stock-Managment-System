package com.StockManawgment.dto;

import com.StockManawgment.entity.Purchase;
import com.StockManawgment.entity.PurchaseItem;
import java.util.List;

public class PurchaseRequest {
    private Purchase purchase;
    private List<PurchaseItem> items;

    public Purchase getPurchase() { return purchase; }
    public void setPurchase(Purchase purchase) { this.purchase = purchase; }
    public List<PurchaseItem> getItems() { return items; }
    public void setItems(List<PurchaseItem> items) { this.items = items; }
}
