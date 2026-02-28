<?php
// Database connection configuration
$servername = "localhost";
$username = "root";
$password = ""; // Change this to your MySQL password
$database = "parking_management";

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(array("success" => false, "message" => "Connection failed: " . $conn->connect_error)));
}

// Set charset to utf8
$conn->set_charset("utf8");

// API Endpoint Handler
$request_method = $_SERVER['REQUEST_METHOD'];
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

header('Content-Type: application/json');

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Route requests
switch ($endpoint) {
    // MEMBER endpoints
    case 'members':
        if ($request_method == 'GET') {
            getMembers($conn);
        } elseif ($request_method == 'POST') {
            addMember($conn);
        } elseif ($request_method == 'DELETE') {
            deleteMember($conn);
        }
        break;

    // VEHICLE endpoints
    case 'vehicles':
        if ($request_method == 'GET') {
            getVehicles($conn);
        } elseif ($request_method == 'POST') {
            addVehicle($conn);
        } elseif ($request_method == 'DELETE') {
            deleteVehicle($conn);
        }
        break;

    // PARKING endpoints
    case 'parking':
        if ($request_method == 'GET') {
            getParking($conn);
        } elseif ($request_method == 'POST') {
            addParking($conn);
        }
        break;

    // PARKING ARENA endpoints
    case 'parking-arena':
        if ($request_method == 'GET') {
            getParkingArena($conn);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(array("error" => "Endpoint not found"));
}

// MEMBER FUNCTIONS
function getMembers($conn) {
    $sql = "SELECT * FROM MEMBER";
    $result = $conn->query($sql);
    
    $members = array();
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $members[] = $row;
        }
    }
    echo json_encode($members);
}

function addMember($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $m_name = $data['m_name'];
    $m_fname = $data['m_fname'];
    $m_enic = $data['m_enic'];
    $m_contactno = $data['m_contactno'];
    $m_address = $data['m_address'];
    
    $sql = "INSERT INTO MEMBER (M_name, M_fname, M_enic, M_contactno, M_address) 
            VALUES ('$m_name', '$m_fname', '$m_enic', '$m_contactno', '$m_address')";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(array("success" => true, "message" => "Member added successfully"));
    } else {
        echo json_encode(array("success" => false, "message" => "Error: " . $conn->error));
    }
}

function deleteMember($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $m_id = $data['m_id'];
    
    $sql = "DELETE FROM MEMBER WHERE M_id = $m_id";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(array("success" => true, "message" => "Member deleted successfully"));
    } else {
        echo json_encode(array("success" => false, "message" => "Error: " . $conn->error));
    }
}

// VEHICLE FUNCTIONS
function getVehicles($conn) {
    $sql = "SELECT v.*, m.M_name FROM VEHICLE v 
            LEFT JOIN MEMBER m ON v.M_id = m.M_id";
    $result = $conn->query($sql);
    
    $vehicles = array();
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $vehicles[] = $row;
        }
    }
    echo json_encode($vehicles);
}

function addVehicle($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $v_regno = $data['v_regno'];
    $v_engno = $data['v_engno'];
    $v_name = $data['v_name'];
    $v_model = $data['v_model'];
    $v_color = $data['v_color'];
    $v_chasesno = $data['v_chasesno'];
    $p_id = $data['p_id'];
    $p_name = $data['p_name'];
    $m_id = $data['m_id'];
    
    $sql = "INSERT INTO VEHICLE (V_regno, V_engno, V_name, V_model, V_color, V_chasesno, P_id, P_name, M_id) 
            VALUES ('$v_regno', '$v_engno', '$v_name', '$v_model', '$v_color', '$v_chasesno', $p_id, '$p_name', $m_id)";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(array("success" => true, "message" => "Vehicle added successfully"));
    } else {
        echo json_encode(array("success" => false, "message" => "Error: " . $conn->error));
    }
}

function deleteVehicle($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $v_id = $data['v_id'];
    
    $sql = "DELETE FROM VEHICLE WHERE V_id = $v_id";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(array("success" => true, "message" => "Vehicle deleted successfully"));
    } else {
        echo json_encode(array("success" => false, "message" => "Error: " . $conn->error));
    }
}

// PARKING FUNCTIONS
function getParking($conn) {
    $sql = "SELECT pr.*, m.M_name, v.V_regno, pa.P_row, pa.P_column, pa.P_block 
            FROM PARKING_RECORD pr
            LEFT JOIN MEMBER m ON pr.M_id = m.M_id
            LEFT JOIN VEHICLE v ON pr.V_id = v.V_id
            LEFT JOIN PARKING_ARENA pa ON pr.P_id = pa.P_id";
    $result = $conn->query($sql);
    
    $parkings = array();
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $parkings[] = $row;
        }
    }
    echo json_encode($parkings);
}

function addParking($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $v_id = $data['v_id'];
    $p_id = $data['p_id'];
    $m_id = $data['m_id'];
    $entry_time = date('Y-m-d H:i:s');
    
    // Insert parking record
    $sql = "INSERT INTO PARKING_RECORD (V_id, P_id, M_id, Entry_time, status) 
            VALUES ($v_id, $p_id, $m_id, '$entry_time', 'Active')";
    
    if ($conn->query($sql) === TRUE) {
        // Update parking arena
        $update_sql = "UPDATE PARKING_ARENA SET is_occupied = TRUE WHERE P_id = $p_id";
        $conn->query($update_sql);
        
        echo json_encode(array("success" => true, "message" => "Parking recorded successfully"));
    } else {
        echo json_encode(array("success" => false, "message" => "Error: " . $conn->error));
    }
}

// PARKING ARENA FUNCTIONS
function getParkingArena($conn) {
    $sql = "SELECT * FROM PARKING_ARENA";
    $result = $conn->query($sql);
    
    $arena = array();
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $arena[] = $row;
        }
    }
    echo json_encode($arena);
}

$conn->close();
?>
 <label>Mobile Number:</label>
        <input type="tel" id="signupMobile"
               placeholder="Enter 10 digit mobile"
               maxlength="10"
               required>
    </div>

    <button type="button" class="btn btn-success" onclick="sendOTP()">
        Send OTP
    </button>

    <div id="recaptcha-container" style="margin-top:10px;"></div>

    <div id="otpSection" style="display:none; margin-top:10px;">
        <label>Enter OTP:</label>
        <input type="text" id="signupOTP" placeholder="Enter OTP" required>
        <button type="button" class="btn btn-primary" onclick="verifyOTP()">
            Verify OTP
        </button>
    </div>
                  
