package com.StockManawgment.Stock_Managment.service;

import com.StockManawgment.Stock_Managment.entity.Supplier;
import com.StockManawgment.Stock_Managment.exception.ResourceNotFoundException;
import com.StockManawgment.Stock_Managment.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public Supplier addSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
    }

    public Supplier updateSupplier(Long id, Supplier supplierDetails) {
        Supplier supplier = getSupplierById(id);
        supplier.setSupplierName(supplierDetails.getSupplierName());
        supplier.setContactNumber(supplierDetails.getContactNumber());
        supplier.setEmail(supplierDetails.getEmail());
        supplier.setAddress(supplierDetails.getAddress());
        supplier.setCompanyName(supplierDetails.getCompanyName());
        return supplierRepository.save(supplier);
    }

    public void deleteSupplier(Long id) {
        supplierRepository.delete(getSupplierById(id));
    }

    public List<Supplier> searchSuppliers(String keyword) {
        return supplierRepository.findBySupplierNameContainingIgnoreCase(keyword);
    }
}
