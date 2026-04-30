package com.iheb.gestion_universite.teaching.room;

import com.iheb.gestion_universite.teaching.room.dto.RoomResponse;
import com.iheb.gestion_universite.teaching.room.dto.RoomRequest;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomEntity getById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RoomNotFoundException("Room not found with id: " + id));
    }

    public List<RoomResponse> getAll() {
        return roomRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Page<RoomResponse> getPage(String search, String building, String location, String type, Pageable pageable) {
        return roomRepository.findAll(buildSpecification(search, building, location, type), pageable)
                .map(this::toResponse);
    }

    public RoomResponse getOne(Long id) {
        return toResponse(getById(id));
    }

    public RoomResponse create(RoomRequest request) {
        String normalizedName = normalizeName(request.name());
        String code = toCode(normalizedName);
        ensureUniqueName(normalizedName);
        ensureUniqueCode(code);

        RoomEntity room = new RoomEntity();
        room.setCode(code);
        applyRequest(room, request, normalizedName);
        return toResponse(roomRepository.save(room));
    }

    public RoomResponse update(Long id, RoomRequest request) {
        RoomEntity room = getById(id);
        String normalizedName = normalizeName(request.name());
        String code = toCode(normalizedName);
        ensureUniqueNameForUpdate(id, normalizedName);
        ensureUniqueCodeForUpdate(id, code);

        room.setCode(code);
        applyRequest(room, request, normalizedName);
        return toResponse(roomRepository.save(room));
    }

    public void delete(Long id) {
        roomRepository.delete(getById(id));
    }

    private RoomResponse toResponse(RoomEntity room) {
        return new RoomResponse(
                room.getId(),
                room.getCode(),
                room.getName(),
                room.getCapacity(),
                room.getType(),
                room.getBuilding(),
                room.getLocation()
        );
    }

    private void applyRequest(RoomEntity room, RoomRequest request, String normalizedName) {
        room.setName(normalizedName);
        room.setCapacity(request.capacity());
        room.setType(normalizeText(request.type()));
        room.setBuilding(normalizeText(request.building()));
        room.setLocation(normalizeText(request.location()));
    }

    private Specification<RoomEntity> buildSpecification(String search, String building, String location, String type) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(search)) {
                String pattern = likePattern(search);
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("building")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), pattern)
                ));
            }

            if (StringUtils.hasText(building)) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("building")), likePattern(building)));
            }

            if (StringUtils.hasText(location)) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("location")), location.trim().toLowerCase()));
            }

            if (StringUtils.hasText(type)) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("type")), type.trim().toLowerCase()));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void ensureUniqueName(String name) {
        if (roomRepository.existsByNameIgnoreCase(name)) {
            throw new RoomAlreadyExistsException("Room name already exists");
        }
    }

    private void ensureUniqueNameForUpdate(Long id, String name) {
        if (roomRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new RoomAlreadyExistsException("Room name already exists");
        }
    }

    private void ensureUniqueCode(String code) {
        if (roomRepository.existsByCodeIgnoreCase(code)) {
            throw new RoomAlreadyExistsException("Room code already exists");
        }
    }

    private void ensureUniqueCodeForUpdate(Long id, String code) {
        if (roomRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new RoomAlreadyExistsException("Room code already exists");
        }
    }

    private String normalizeName(String value) {
        return value == null ? null : value.trim().toUpperCase();
    }

    private String normalizeText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }


    private String likePattern(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }

    private String toCode(String name) {
        return name == null ? null : name.replaceAll("\\s+", "-");
    }
}
