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
                row.className = "hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100";
                
                // I updated the HTML below to show the numbers WITH the icons in clean pill shapes
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-semibold text-gray-900">${name}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        <a href="tel:${cleanPhone}" class="${cleanPhone ? '' : 'pointer-events-none opacity-50'} inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white btn-transition font-medium text-sm border border-blue-200" title="Call ${cleanPhone}">
                            <i class="fa-solid fa-phone"></i> ${cleanPhone}
                        </a>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        <a href="https://wa.me/${cleanWa.replace('+','')}" target="_blank" class="${cleanWa ? '' : 'pointer-events-none opacity-50'} inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 hover:bg-green-600 hover:text-white btn-transition font-medium text-sm border border-green-200" title="WhatsApp ${cleanWa}">
                            <i class="fa-brands fa-whatsapp text-lg"></i> ${cleanWa}
                        </a>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        <div class="flex items-center justify-center gap-2" id="status-container-${index}">
                            <button onclick="setStatus(${index}, 'attended')" class="p-2 rounded hover:bg-gray-100 text-gray-400 hover:text-green-500 btn-transition" title="Mark Attended">
                                <i class="fa-solid fa-check-circle text-xl"></i>
                            </button>
                            <button onclick="setStatus(${index}, 'missed')" class="p-2 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 btn-transition" title="Mark Missed">
                                <i class="fa-solid fa-times-circle text-xl"></i>
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
        container.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"><i class="fa-solid fa-check"></i> Attended</span>
        <button onclick="resetStatus(${index})" class="text-xs text-gray-400 hover:text-gray-600 ml-2 underline">Undo</button>`;
    } else {
        container.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"><i class="fa-solid fa-xmark"></i> Missed</span>
        <button onclick="resetStatus(${index})" class="text-xs text-gray-400 hover:text-gray-600 ml-2 underline">Undo</button>`;
    }
}

window.resetStatus = function(index) {
    const container = document.getElementById(`status-container-${index}`);
    container.innerHTML = `
        <button onclick="setStatus(${index}, 'attended')" class="p-2 rounded hover:bg-gray-100 text-gray-400 hover:text-green-500 btn-transition" title="Mark Attended">
            <i class="fa-solid fa-check-circle text-xl"></i>
        </button>
        <button onclick="setStatus(${index}, 'missed')" class="p-2 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 btn-transition" title="Mark Missed">
            <i class="fa-solid fa-times-circle text-xl"></i>
        </button>
    `;
}
