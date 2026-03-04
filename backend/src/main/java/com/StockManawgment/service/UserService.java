package com.StockManawgment.Stock_Managment.service;

import com.StockManawgment.Stock_Managment.dto.ProfileUpdateRequest;
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

    // ── Create ────────────────────────────────────────────────────────────────

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BadRequestException("Email already exists: " + user.getEmail());
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getStatus() == null) user.setStatus(User.Status.ACTIVE);
        return userRepository.save(user);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    // ── Admin: update name/email only — role is NOT changed here ─────────────
    // Role changes must go through changeRole() using the dedicated PATCH endpoint

    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setName(userDetails.getName());
        // Check email uniqueness only if it actually changed
        if (!user.getEmail().equals(userDetails.getEmail())) {
            if (userRepository.existsByEmail(userDetails.getEmail())) {
                throw new BadRequestException("Email already in use: " + userDetails.getEmail());
            }
            user.setEmail(userDetails.getEmail());
        }
        // Role is intentionally NOT updated here — use PATCH /{id}/role instead
        return userRepository.save(user);
    }

    // ── Delete — guard: admin cannot delete their own account ────────────────

    public void deleteUser(Long id, String callerEmail) {
        User user = getUserById(id);
        if (user.getEmail().equals(callerEmail)) {
            throw new BadRequestException("You cannot delete your own account");
        }
        userRepository.delete(user);
    }

    // ── Status ────────────────────────────────────────────────────────────────

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

    // ── Role ──────────────────────────────────────────────────────────────────

    public User changeRole(Long id, User.Role newRole) {
        User user = getUserById(id);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    // ── Admin password reset (no current password check) ─────────────────────

    public User resetPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }
        User user = getUserById(id);
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    // ── Self-service profile update ───────────────────────────────────────────

    public User updateProfile(String callerEmail, ProfileUpdateRequest request) {
        User user = getByEmail(callerEmail);
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new BadRequestException("Name cannot be empty");
        }
        user.setName(request.getName().trim());
        // Check email uniqueness only if it changed
        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use: " + request.getEmail());
            }
            user.setEmail(request.getEmail().trim());
        }
        return userRepository.save(user);
    }

    // ── Self-service password change (current password verification required) ─

    public void changeOwnPassword(String callerEmail, String currentPassword, String newPassword) {
        if (currentPassword == null || currentPassword.isEmpty()) {
            throw new BadRequestException("Current password is required");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }
        User user = getByEmail(callerEmail);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (currentPassword.equals(newPassword)) {
            throw new BadRequestException("New password must be different from current password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}