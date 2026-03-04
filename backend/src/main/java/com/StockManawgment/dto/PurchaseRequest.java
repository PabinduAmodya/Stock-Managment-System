package com.StockManawgment.Stock_Managment.dto;

import com.StockManawgment.Stock_Managment.entity.Purchase;
import com.StockManawgment.Stock_Managment.entity.PurchaseItem;
import java.util.List;

public class PurchaseRequest {
    private Purchase purchase;
    private List<PurchaseItem> items;

    public Purchase getPurchase() { return purchase; }
    public void setPurchase(Purchase purchase) { this.purchase = purchase; }
    public List<PurchaseItem> getItems() { return items; }
    public void setItems(List<PurchaseItem> items) { this.items = items; }
}
