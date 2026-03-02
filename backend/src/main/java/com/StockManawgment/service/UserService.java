package com.StockManawgment.Stock_Managment.service;

import com.StockManawgment.Stock_Managment.entity.User;
import com.StockManawgment.Stock_Managment.exception.BadRequestException;
import com.StockManawgment.Stock_Managment.exception.ResourceNotFoundException;
import com.StockManawgment.Stock_Managment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BadRequestException("Email already exists: " + user.getEmail());
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getStatus() == null) user.setStatus(User.Status.ACTIVE);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    public User activateUser(Long id) {
        User user = getUserById(id);
        user.setStatus(User.Status.ACTIVE);
        return userRepository.save(user);
    }

    public User deactivateUser(Long id) {
        User user = getUserById(id);
        user.setStatus(User.Status.INACTIVE);
        return userRepository.save(user);
    }

    public User changeRole(Long id, User.Role newRole) {
        User user = getUserById(id);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public User resetPassword(Long id, String newPassword) {
        User user = getUserById(id);
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }
}
