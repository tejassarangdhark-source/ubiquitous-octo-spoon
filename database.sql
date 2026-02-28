-- Parking Management System Database Schema

-- MEMBER Table
CREATE TABLE MEMBER (
    M_id INT PRIMARY KEY AUTO_INCREMENT,
    M_name VARCHAR(100) NOT NULL,
    M_fname VARCHAR(100) NOT NULL,
    M_enic VARCHAR(20) UNIQUE NOT NULL,
    M_contactno VARCHAR(20) NOT NULL,
    M_address TEXT NOT NULL
);

-- VEHICLE Table
CREATE TABLE VEHICLE (
    V_id INT PRIMARY KEY AUTO_INCREMENT,
    V_regno VARCHAR(20) UNIQUE NOT NULL,
    V_engno VARCHAR(50) UNIQUE NOT NULL,
    V_name VARCHAR(50) NOT NULL,
    V_model VARCHAR(50) NOT NULL,
    V_color VARCHAR(30) NOT NULL,
    V_chasesno VARCHAR(50) UNIQUE NOT NULL,
    P_id INT NOT NULL,
    P_name VARCHAR(100),
    M_id INT NOT NULL,
    FOREIGN KEY (M_id) REFERENCES MEMBER(M_id) ON DELETE CASCADE
);

-- PARKING_ARENA Table
CREATE TABLE PARKING_ARENA (
    P_id INT PRIMARY KEY AUTO_INCREMENT,
    P_row INT NOT NULL,
    P_column INT NOT NULL,
    P_block INT NOT NULL,
    date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_occupied BOOLEAN DEFAULT FALSE
);

-- PARKINGTIME Table (Entry and Exit times)
CREATE TABLE PARKINGTIME (
    Pt_id INT PRIMARY KEY AUTO_INCREMENT,
    M_id INT NOT NULL,
    In_time DATETIME NOT NULL,
    Out_time DATETIME,
    status VARCHAR(20) DEFAULT 'Active',
    FOREIGN KEY (M_id) REFERENCES MEMBER(M_id) ON DELETE CASCADE
);

-- PARKING Record Table (Relationship between Vehicle and Parking Arena)
CREATE TABLE PARKING_RECORD (
    PR_id INT PRIMARY KEY AUTO_INCREMENT,
    V_id INT NOT NULL,
    P_id INT NOT NULL,
    M_id INT NOT NULL,
    Pt_id INT,
    Entry_time DATETIME NOT NULL,
    Exit_time DATETIME,
    status VARCHAR(20) DEFAULT 'Active',
    FOREIGN KEY (V_id) REFERENCES VEHICLE(V_id) ON DELETE CASCADE,
    FOREIGN KEY (P_id) REFERENCES PARKING_ARENA(P_id) ON DELETE CASCADE,
    FOREIGN KEY (M_id) REFERENCES MEMBER(M_id) ON DELETE CASCADE,
    FOREIGN KEY (Pt_id) REFERENCES PARKINGTIME(Pt_id) ON DELETE SET NULL
);

-- Insert Sample Data
INSERT INTO MEMBER (M_name, M_fname, M_enic, M_contactno, M_address) VALUES
('Ahmed Ali', 'Muhammad Ali', '12345-1234567-1', '03001234567', 'Karachi, Pakistan'),
('Fatima Khan', 'Khan Sahab', '12346-1234567-2', '03012345678', 'Lahore, Pakistan'),
('Hassan Abbas', 'Abbas Ahmed', '12347-1234567-3', '03021234567', 'Islamabad, Pakistan');

INSERT INTO PARKING_ARENA (P_row, P_column, P_block, is_occupied) VALUES
(1, 1, 1, FALSE),
(1, 2, 1, FALSE),
(1, 3, 1, FALSE),
(1, 4, 1, FALSE),
(2, 1, 1, FALSE),
(2, 2, 1, FALSE),
(2, 3, 1, FALSE),
(2, 4, 1, FALSE),
(3, 1, 1, FALSE),
(3, 2, 1, FALSE),
(3, 3, 1, FALSE),
(3, 4, 1, FALSE),
(4, 1, 2, FALSE),
(4, 2, 2, FALSE),
(4, 3, 2, FALSE),
(4, 4, 2, FALSE),
(5, 1, 2, FALSE),
(5, 2, 2, FALSE),
(5, 3, 2, FALSE),
(5, 4, 2, FALSE);

INSERT INTO VEHICLE (V_regno, V_engno, V_name, V_model, V_color, V_chasesno, P_id, P_name, M_id) VALUES
('ABC-1234', 'ENG123456', 'Honda Civic', '2021', 'Silver', 'CHS123456789', 1, 'Slot 1-1', 1),
('XYZ-5678', 'ENG234567', 'Toyota Corolla', '2020', 'White', 'CHS234567890', 2, 'Slot 1-2', 2),
('PQR-9101', 'ENG345678', 'Suzuki Swift', '2022', 'Red', 'CHS345678901', 3, 'Slot 1-3', 3);

-- Indexes for better query performance
CREATE INDEX idx_member_enic ON MEMBER(M_enic);
CREATE INDEX idx_vehicle_member ON VEHICLE(M_id);
CREATE INDEX idx_parking_record_status ON PARKING_RECORD(status);
CREATE INDEX idx_parkingtime_status ON PARKINGTIME(status);
