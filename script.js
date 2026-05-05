// Direct Google Sheets CSV Link
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRHS5253oULSenHnHhzECS7jWHexwym5rylq-PYSz7wM3P8LL1ON84U0PzITDbUPWzvff3z0U2E8KQ8/pub?gid=893169484&single=true&output=csv";

// Utility to clean phone numbers
function cleanNumber(numStr) {
    if(!numStr) return "";
    let cleaned = numStr.replace(/^p:/i, '').replace(/\s+/g, '');
    if(!cleaned.startsWith('+') && cleaned.length >= 10) {
        if(cleaned.length === 10) cleaned = "+91" + cleaned;
    }
    return cleaned;
}

// Data Fetching Logic
document.getElementById('loadDataBtn').addEventListener('click', function() {
    const tableBody = document.getElementById('tableBody');
    const btn = this;
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Fetching...';
    btn.disabled = true;

    // Directly parse the CSV
    Papa.parse(CSV_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            tableBody.innerHTML = ''; // Clear table
            const leads = results.data;
            
            leads.forEach((lead, index) => {
                const name = lead['Full_Name'] || 'Unknown';
                const phoneRaw = lead['Phone_Number'] || '';
                const waRaw = lead['Whatsapp_Number'] || '';
                
                const cleanPhone = cleanNumber(phoneRaw);
                const cleanWa = cleanNumber(waRaw);
                
                const row = document.createElement('tr');
                row.className = "hover:bg-blue-50 transition-colors duration-150"; // Premium hover effect
                
                // Note the "border border-gray-300" classes added to every <td>
                row.innerHTML = `
                    <td class="border border-gray-300 px-6 py-4 whitespace-nowrap">
                        <div class="text-base font-semibold text-gray-900">${name}</div>
                    </td>
                    <td class="border border-gray-300 px-6 py-4 whitespace-nowrap text-center">
                        <a href="tel:${cleanPhone}" class="${cleanPhone ? '' : 'pointer-events-none opacity-50'} inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white text-blue-600 hover:bg-blue-600 hover:text-white btn-transition font-bold border-2 border-blue-200 hover:border-blue-600 shadow-sm w-44" title="Call ${cleanPhone}">
                            <i class="fa-solid fa-phone"></i> ${cleanPhone}
                        </a>
                    </td>
                    <td class="border border-gray-300 px-6 py-4 whitespace-nowrap text-center">
                        <a href="https://wa.me/${cleanWa.replace('+','')}" target="_blank" class="${cleanWa ? '' : 'pointer-events-none opacity-50'} inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white text-green-600 hover:bg-green-600 hover:text-white btn-transition font-bold border-2 border-green-200 hover:border-green-600 shadow-sm w-44" title="WhatsApp ${cleanWa}">
                            <i class="fa-brands fa-whatsapp text-lg"></i> ${cleanWa}
                        </a>
                    </td>
                    <td class="border border-gray-300 px-6 py-4 whitespace-nowrap text-center bg-gray-50" style="width: 250px;">
                        <div class="flex items-center justify-center gap-3" id="status-container-${index}">
                            <button onclick="setStatus(${index}, 'attended')" class="flex-1 bg-white border-2 border-gray-300 px-3 py-2 rounded-md hover:bg-green-50 hover:text-green-600 hover:border-green-400 btn-transition shadow-sm text-gray-500 font-medium" title="Mark Attended">
                                <i class="fa-solid fa-check text-lg"></i>
                            </button>
                            <button onclick="setStatus(${index}, 'missed')" class="flex-1 bg-white border-2 border-gray-300 px-3 py-2 rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-400 btn-transition shadow-sm text-gray-500 font-medium" title="Mark Unattended">
                                <i class="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Refresh Data';
            btn.disabled = false;
        },
        error: function(err) {
            console.error("PapaParse Error:", err);
            alert("Network error.");
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Fetch Latest Leads';
            btn.disabled = false;
        }
    });
});

// Status Toggle Functions
window.setStatus = function(index, status) {
    const container = document.getElementById(`status-container-${index}`);
    
    if(status === 'attended') {
        // Solid Green Block
        container.innerHTML = `
            <div class="flex flex-col w-full">
                <div class="bg-green-500 text-white font-bold py-2.5 px-4 rounded-md shadow-md flex items-center justify-center gap-2 border border-green-600 w-full tracking-wide">
                    <i class="fa-solid fa-check-circle text-lg"></i> ATTENDED
                </div>
                <button onclick="resetStatus(${index})" class="mt-2 text-xs text-gray-400 hover:text-gray-700 underline font-medium text-right w-full">Undo</button>
            </div>
        `;
    } else {
        // Solid Red Block
        container.innerHTML = `
            <div class="flex flex-col w-full">
                <div class="bg-red-500 text-white font-bold py-2.5 px-4 rounded-md shadow-md flex items-center justify-center gap-2 border border-red-600 w-full tracking-wide">
                    <i class="fa-solid fa-times-circle text-lg"></i> UNATTENDED
                </div>
                <button onclick="resetStatus(${index})" class="mt-2 text-xs text-gray-400 hover:text-gray-700 underline font-medium text-right w-full">Undo</button>
            </div>
        `;
    }
}

// Reset function puts the buttons back
window.resetStatus = function(index) {
    const container = document.getElementById(`status-container-${index}`);
    container.innerHTML = `
        <button onclick="setStatus(${index}, 'attended')" class="flex-1 bg-white border-2 border-gray-300 px-3 py-2 rounded-md hover:bg-green-50 hover:text-green-600 hover:border-green-400 btn-transition shadow-sm text-gray-500 font-medium" title="Mark Attended">
            <i class="fa-solid fa-check text-lg"></i>
        </button>
        <button onclick="setStatus(${index}, 'missed')" class="flex-1 bg-white border-2 border-gray-300 px-3 py-2 rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-400 btn-transition shadow-sm text-gray-500 font-medium" title="Mark Unattended">
            <i class="fa-solid fa-xmark text-lg"></i>
        </button>
    `;
}
