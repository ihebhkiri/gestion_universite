package com.iheb.gestion_universite.core.storage;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final Cloudinary cloudinary;

    public String store(MultipartFile file) {
        return store(file, "gestion-universitaire");
    }

    public String store(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        try {
            Map<String, Object> options = new HashMap<>();
            options.put("folder", folder);
            options.put("resource_type", "auto");
            options.put("use_filename", true);
            options.put("unique_filename", true);

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cloudinary did not return a secure URL");
            }
            return secureUrl.toString();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to upload file to Cloudinary", e);
        }
    }

    public List<String> storeAll(MultipartFile[] files, String folder) {
        List<String> urls = new ArrayList<>();
        if (files == null) {
            return urls;
        }
        for (MultipartFile file : files) {
            String url = store(file, folder);
            if (url != null) {
                urls.add(url);
            }
        }
        return urls;
    }

    public Path load(String filename) {
        throw new UnsupportedOperationException("Files are stored in Cloudinary. Use the stored URL directly.");
    }
}
