// =========================================================
// VIT-coin Dashboard JavaScript
// =========================================================


// ----------------- Wallet -----------------

async function createWallet() {

    const name = document.getElementById("walletName").value;

    if (!name) {
        return alert("Enter wallet name");
    }

    const res = await fetch("/wallet/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
    });

    const data = await res.json();

    alert("Wallet created! Address: " + data.address);

    document.getElementById("walletName").value = "";

    loadWallets();
}


// ----------------- Load Wallets -----------------

async function loadWallets() {

    const res = await fetch("/wallets");
    const data = await res.json();

    const tbody = document.querySelector("#walletTable tbody");

    tbody.innerHTML = "";

    for (let key in data) {

        const w = data[key];

        const balRes = await fetch("/balance/" + w.address);
        const balData = await balRes.json();

        const initial = (w.name || "?").trim().charAt(0).toUpperCase();
        const colorIdx = initial.charCodeAt(0) % 5;

        const row = `
            <tr>
                <td>
                    <div class="wallet-name">
                        <span class="wallet-avatar avatar-${colorIdx}">${initial}</span>
                        <span>${w.name}</span>
                    </div>
                </td>
                <td>
                    <div class="address-cell">
                        <span class="address-text" title="${w.address}">${w.address}</span>
                        <button type="button" class="copy-btn"
                                title="Copy address" aria-label="Copy address"
                                onclick="copyAddress('${w.address}', this)">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" stroke-width="2"
                                 stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="12" height="12" rx="2"></rect>
                                <path d="M5 15V5a2 2 0 0 1 2-2h10"></path>
                            </svg>
                        </button>
                    </div>
                </td>
                <td>${balData.balance}</td>
            </tr>
        `;

        tbody.innerHTML += row;
    }
}


// ----------------- Copy Address -----------------

function copyAddress(address, btn) {

    const done = () => {
        btn.classList.add("copied");
        setTimeout(() => btn.classList.remove("copied"), 1500);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(address).then(done);
    } else {
        const t = document.createElement("textarea");
        t.value = address;
        document.body.appendChild(t);
        t.select();
        document.execCommand("copy");
        document.body.removeChild(t);
        done();
    }
}


// ----------------- Transaction -----------------

async function sendTx() {

    const sender =
        document.getElementById("txFrom").value;

    const receiver =
        document.getElementById("txTo").value;

    const amount =
        parseInt(document.getElementById("txAmount").value);


    if (!sender || !receiver || !amount) {
        return alert("Fill all fields");
    }


    const res = await fetch("/tx/new", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            from: sender,
            to: receiver,
            amount
        })
    });


    const data = await res.json();


    if (data.error) {
        return alert("Error: " + data.error);
    }


    alert("Transaction created: " + data.txid);


    document.getElementById("txFrom").value = "";
    document.getElementById("txTo").value = "";
    document.getElementById("txAmount").value = "";


    loadMempool();
}


// ----------------- Mempool -----------------

async function loadMempool() {

    const res = await fetch("/mempool");

    const data = await res.json();

    const tbody =
        document.querySelector("#mempoolTable tbody");

    tbody.innerHTML = "";


    data.forEach(tx => {

        const from =
            tx.inputs.length > 0
                ? tx.inputs[0].txid
                : "coinbase";

        const to =
            tx.outputs[0].address;

        const amount =
            tx.outputs[0].amount;


        const row = `
            <tr>
                <td>${tx.txid}</td>
                <td>${from}</td>
                <td>${to}</td>
                <td>${amount}</td>
            </tr>
        `;


        tbody.innerHTML += row;
    });
}


// ----------------- Mining -----------------

async function mineBlock() {

    const miner =
        document.getElementById("minerAddress").value;


    if (!miner) {
        return alert("Enter miner address");
    }


    const res = await fetch("/mine", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            miner
        })
    });


    const block = await res.json();


    alert("Block mined! Hash: " + block.hash);


    document.getElementById("minerAddress").value = "";


    loadWallets();
    loadChain();
    loadMempool();
}


// ----------------- Blockchain -----------------

async function loadChain() {

    const res = await fetch("/chain");

    const data = await res.json();


    const tbody =
        document.querySelector("#chainTable tbody");


    tbody.innerHTML = "";


    data.chain.forEach(block => {

        const txs =
            block.transactions
                .map(t => t.txid)
                .join(", ");


        const row = `
            <tr>
                <td>${block.index}</td>
                <td>${block.hash}</td>
                <td>${block.previous_hash}</td>
                <td>${txs}</td>
            </tr>
        `;


        tbody.innerHTML += row;
    });
}


// ----------------- Initial Load -----------------

loadWallets();
loadMempool();
loadChain();