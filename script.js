const KEY="ekasir_toko_komplit_v1";
let db=JSON.parse(localStorage.getItem(KEY)||"null")||{
 settings:{storeName:"Toko Komplit",address:"Alamat toko",phone:"",footer:"Terima kasih telah berbelanja."},
 products:[
  {id:1,code:"BRG001",name:"Air Mineral 600ml",category:"Minuman",stock:48,min:10,buy:2500,sell:4000},
  {id:2,code:"BRG002",name:"Mie Instan Goreng",category:"Makanan",stock:35,min:8,buy:2500,sell:3500},
  {id:3,code:"BRG003",name:"Kopi Sachet",category:"Minuman",stock:22,min:5,buy:1200,sell:2000},
  {id:4,code:"BRG004",name:"Gula 1 Kg",category:"Sembako",stock:15,min:5,buy:15000,sell:18000},
  {id:5,code:"BRG005",name:"Minyak Goreng 1L",category:"Sembako",stock:18,min:5,buy:16000,sell:19000},
  {id:6,code:"BRG006",name:"Sabun Mandi",category:"Kebutuhan",stock:12,min:4,buy:3500,sell:5000}
 ],
 sales:[],expenses:[],cart:[]
};
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
const rupiah=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function today(){return new Date().toISOString().slice(0,10)}
function showPage(id){
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById(id).classList.add("active");
 document.querySelectorAll(".nav-btn").forEach(x=>x.classList.toggle("active",x.dataset.page===id));
 document.getElementById("pageTitle").textContent=document.querySelector(`[data-page="${id}"]`).textContent.replace(/^[^ ]+ /,"");
 if(id==="dashboard")renderDashboard();if(id==="kasir"){populateCategories();renderProductPicker();renderCart()}
 if(id==="produk")renderProducts();if(id==="pengeluaran")renderExpenses();if(id==="laporan")renderReports();if(id==="struk")renderReceipts();if(id==="pengaturan")loadSettings();
}
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.getElementById("menuToggle").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
function notify(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function populateCategories(){
 const cats=[...new Set(db.products.map(p=>p.category))].sort();
 ["categoryFilter","stockCategory"].forEach(id=>{const s=document.getElementById(id),v=s.value;s.innerHTML='<option value="">Semua kategori</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join("");s.value=v});
}
function renderDashboard(){
 const d=today(), sales=db.sales.filter(s=>s.date.slice(0,10)===d), ex=db.expenses.filter(e=>e.date===d);
 const st=sales.reduce((a,s)=>a+s.total,0), et=ex.reduce((a,e)=>a+e.amount,0);
 document.getElementById("dashSales").textContent=rupiah(st);document.getElementById("dashTransactions").textContent=sales.length+" transaksi";
 document.getElementById("dashExpenses").textContent=rupiah(et);document.getElementById("dashProfit").textContent=rupiah(st-et);
 const low=db.products.filter(p=>p.stock<=p.min);document.getElementById("dashLowStock").textContent=low.length;
 document.getElementById("lowStockList").innerHTML=low.length?low.slice(0,6).map(p=>`<div class="low-item"><span>${esc(p.name)}</span><span class="badge red">${p.stock} tersisa</span></div>`).join(""):"<p>Tidak ada stok menipis.</p>";
 const recent=[...db.sales].sort((a,b)=>b.created.localeCompare(a.created)).slice(0,6);
 document.getElementById("recentSales").innerHTML=recent.length?recent.map(s=>`<tr><td>${esc(s.invoice)}</td><td>${esc(s.date)}</td><td>${esc(s.customer)}</td><td>${rupiah(s.total)}</td><td><span class="payment-pill">${esc(s.payment)}</span></td></tr>`).join(""):'<tr><td colspan="5">Belum ada transaksi.</td></tr>';
 const days=[];for(let i=6;i>=0;i--){const x=new Date();x.setDate(x.getDate()-i);const ds=x.toISOString().slice(0,10);days.push({ds,val:db.sales.filter(s=>s.date.slice(0,10)===ds).reduce((a,s)=>a+s.total,0)})}
 const max=Math.max(...days.map(x=>x.val),1);document.getElementById("salesChart").innerHTML=days.map(x=>`<div class="bar" style="height:${Math.max(5,x.val/max*170)}px"><em>${x.val?rupiah(x.val).replace("Rp ","Rp "):""}</em><span>${x.ds.slice(5)}</span></div>`).join("");
}
function renderProductPicker(){
 const q=document.getElementById("productSearch").value.toLowerCase(),cat=document.getElementById("categoryFilter").value;
 const list=db.products.filter(p=>(!q||p.name.toLowerCase().includes(q)||p.code.toLowerCase().includes(q))&&(!cat||p.category===cat));
 document.getElementById("productPicker").innerHTML=list.map(p=>`<div class="product-card" onclick="addToCart(${p.id})"><small>${esc(p.code)} • ${esc(p.category)}</small><b>${esc(p.name)}</b><span class="price">${rupiah(p.sell)}</span><small>Stok: ${p.stock}</small></div>`).join("")||"<p>Barang tidak ditemukan.</p>";
}
function addToCart(id){const p=db.products.find(x=>x.id===id);if(!p||p.stock<=0)return notify("Stok habis.");let c=db.cart.find(x=>x.id===id);if(c){if(c.qty>=p.stock)return notify("Jumlah melebihi stok.");c.qty++}else db.cart.push({id,qty:1});renderCart()}
function changeQty(id,n){const c=db.cart.find(x=>x.id===id),p=db.products.find(x=>x.id===id);if(!c)return;c.qty+=n;if(c.qty<=0)db.cart=db.cart.filter(x=>x.id!==id);else if(c.qty>p.stock)c.qty=p.stock;renderCart()}
function clearCart(){db.cart=[];renderCart()}
function renderCart(){
 let sub=0;document.getElementById("cartItems").innerHTML=db.cart.length?db.cart.map(c=>{const p=db.products.find(x=>x.id===c.id),t=p.sell*c.qty;sub+=t;return `<div class="cart-row"><div><b>${esc(p.name)}</b><small>${rupiah(p.sell)} × ${c.qty}</small></div><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><span>${c.qty}</span><button onclick="changeQty(${p.id},1)">+</button><button class="action delete" onclick="changeQty(${p.id},-${c.qty})">×</button></div></div>`}).join(""):"<p>Keranjang kosong.</p>";
 const disc=Number(document.getElementById("discount").value)||0,taxPct=Number(document.getElementById("tax").value)||0,tax=(sub-disc)*taxPct/100,total=Math.max(0,sub-disc+tax);
 document.getElementById("cartSubtotal").textContent=rupiah(sub);document.getElementById("cartTotal").textContent=rupiah(total);document.getElementById("cartCount").textContent=db.cart.reduce((a,c)=>a+c.qty,0)+" item";calculateChange()
}
function calculateChange(){const total=parseCurrency(document.getElementById("cartTotal").textContent),paid=Number(document.getElementById("cashPaid").value)||0;document.getElementById("change").textContent=rupiah(Math.max(0,paid-total))}
function parseCurrency(s){return Number(String(s).replace(/[^\d-]/g,""))||0}
function checkout(){
 if(!db.cart.length)return notify("Keranjang masih kosong.");
 const sub=db.cart.reduce((a,c)=>{const p=db.products.find(x=>x.id===c.id);return a+p.sell*c.qty},0),disc=Number(document.getElementById("discount").value)||0,taxPct=Number(document.getElementById("tax").value)||0,tax=(sub-disc)*taxPct/100,total=Math.max(0,sub-disc+tax),paid=Number(document.getElementById("cashPaid").value)||0;
 if(paid<total)return notify("Nominal pembayaran kurang.");
 db.cart.forEach(c=>{db.products.find(p=>p.id===c.id).stock-=c.qty});
 const inv="TRX-"+new Date().getFullYear()+String(Date.now()).slice(-7);
 db.sales.push({invoice:inv,date:new Date().toISOString(),customer:document.getElementById("customerName").value||"Umum",payment:document.getElementById("paymentMethod").value,items:db.cart.map(c=>{const p=db.products.find(x=>x.id===c.id);return{id:p.id,name:p.name,qty:c.qty,price:p.sell,buy:p.buy}}),subtotal:sub,discount:disc,tax,total,paid,change:paid-total,created:new Date().toISOString()});
 save();const sale=db.sales.at(-1);db.cart=[];document.getElementById("customerName").value="";document.getElementById("cashPaid").value="";document.getElementById("discount").value=0;document.getElementById("tax").value=0;renderCart();renderProductPicker();openReceipt(sale);notify("Transaksi berhasil disimpan.")
}
function renderProducts(){
 populateCategories();const q=document.getElementById("stockSearch").value.toLowerCase(),cat=document.getElementById("stockCategory").value;
 const list=db.products.filter(p=>(!q||p.name.toLowerCase().includes(q)||p.code.toLowerCase().includes(q))&&(!cat||p.category===cat));
 document.getElementById("productTable").innerHTML=list.map(p=>`<tr><td>${esc(p.code)}</td><td><b>${esc(p.name)}</b></td><td>${esc(p.category)}</td><td><span class="badge ${p.stock<=p.min?'red':''}">${p.stock}</span></td><td>${p.min}</td><td>${rupiah(p.buy)}</td><td>${rupiah(p.sell)}</td><td>${rupiah(p.buy*p.stock)}</td><td><button class="action" onclick="openProductModal(${p.id})">Edit</button><button class="action delete" onclick="deleteProduct(${p.id})">Hapus</button></td></tr>`).join("")||'<tr><td colspan="9">Belum ada data.</td></tr>';
 document.getElementById("productCount").textContent=db.products.length;document.getElementById("stockValue").textContent=rupiah(db.products.reduce((a,p)=>a+p.buy*p.stock,0));document.getElementById("lowCount").textContent=db.products.filter(p=>p.stock<=p.min).length;
}
function openProductModal(id=null){
 const p=id?db.products.find(x=>x.id===id):{code:"",name:"",category:"",stock:0,min:5,buy:0,sell:0};
 document.getElementById("modalContent").innerHTML=`<h2>${id?"Edit":"Tambah"} Barang</h2><div class="form-grid">
 <label>Kode<input id="fCode" value="${esc(p.code)}"></label><label>Nama Barang<input id="fName" value="${esc(p.name)}"></label>
 <label>Kategori<input id="fCat" value="${esc(p.category)}"></label><label>Stok<input id="fStock" type="number" value="${p.stock}"></label>
 <label>Stok Minimum<input id="fMin" type="number" value="${p.min}"></label><label>Harga Beli<input id="fBuy" type="number" value="${p.buy}"></label>
 <label>Harga Jual<input id="fSell" type="number" value="${p.sell}"></label></div><div class="form-actions"><button class="secondary" onclick="closeModal()">Batal</button><button class="primary" onclick="saveProduct(${id||0})">Simpan</button></div>`;
 document.getElementById("modal").classList.add("show")
}
function saveProduct(id){const data={code:fCode.value.trim(),name:fName.value.trim(),category:fCat.value.trim()||"Umum",stock:Number(fStock.value),min:Number(fMin.value),buy:Number(fBuy.value),sell:Number(fSell.value)};if(!data.code||!data.name)return notify("Kode dan nama wajib diisi.");if(id)Object.assign(db.products.find(p=>p.id===id),data);else db.products.push({id:Date.now(),...data});save();closeModal();renderProducts();notify("Data barang tersimpan.")}
function deleteProduct(id){if(confirm("Hapus barang ini?")){db.products=db.products.filter(p=>p.id!==id);save();renderProducts();notify("Barang dihapus.")}}
function openExpenseModal(){
 document.getElementById("modalContent").innerHTML=`<h2>Tambah Pengeluaran</h2><div class="form-grid"><label>Tanggal<input id="eDate" type="date" value="${today()}"></label><label>Kategori<select id="eCat"><option>Operasional</option><option>Listrik</option><option>Transportasi</option><option>Gaji</option><option>Belanja</option><option>Lainnya</option></select></label><label style="grid-column:1/-1">Keterangan<input id="eNote" placeholder="Contoh: bayar listrik"></label><label>Nominal<input id="eAmount" type="number" min="0"></label></div><div class="form-actions"><button class="secondary" onclick="closeModal()">Batal</button><button class="primary" onclick="saveExpense()">Simpan</button></div>`;document.getElementById("modal").classList.add("show")
}
function saveExpense(){if(!eNote.value.trim()||Number(eAmount.value)<=0)return notify("Lengkapi data pengeluaran.");db.expenses.push({id:Date.now(),date:eDate.value,category:eCat.value,note:eNote.value.trim(),amount:Number(eAmount.value)});save();closeModal();renderExpenses();notify("Pengeluaran disimpan.")}
function renderExpenses(){
 const q=document.getElementById("expenseSearch").value.toLowerCase(),m=document.getElementById("expenseMonth").value;
 const months=[...new Set(db.expenses.map(e=>e.date.slice(0,7)))].sort().reverse();document.getElementById("expenseMonth").innerHTML='<option value="">Semua bulan</option>'+months.map(x=>`<option>${x}</option>`).join("");document.getElementById("expenseMonth").value=m;
 const list=db.expenses.filter(e=>(!q||e.note.toLowerCase().includes(q)||e.category.toLowerCase().includes(q))&&(!m||e.date.startsWith(m)));
 document.getElementById("expenseTable").innerHTML=list.sort((a,b)=>b.date.localeCompare(a.date)).map(e=>`<tr><td>${e.date}</td><td>${esc(e.category)}</td><td>${esc(e.note)}</td><td>${rupiah(e.amount)}</td><td><button class="action delete" onclick="deleteExpense(${e.id})">Hapus</button></td></tr>`).join("")||'<tr><td colspan="5">Belum ada data.</td></tr>';
 const mon=today().slice(0,7);document.getElementById("monthExpense").textContent=rupiah(db.expenses.filter(e=>e.date.startsWith(mon)).reduce((a,e)=>a+e.amount,0));document.getElementById("expenseCount").textContent=db.expenses.length
}
function deleteExpense(id){if(confirm("Hapus pengeluaran?")){db.expenses=db.expenses.filter(e=>e.id!==id);save();renderExpenses()}}
function renderReceipts(){
 const q=document.getElementById("receiptSearch").value.toLowerCase(),list=db.sales.filter(s=>!q||s.invoice.toLowerCase().includes(q)||s.customer.toLowerCase().includes(q)).sort((a,b)=>b.created.localeCompare(a.created));
 document.getElementById("receiptTable").innerHTML=list.map(s=>`<tr><td>${esc(s.invoice)}</td><td>${new Date(s.date).toLocaleString("id-ID")}</td><td>${esc(s.customer)}</td><td>${esc(s.payment)}</td><td>${rupiah(s.total)}</td><td><button class="action" onclick="openReceiptById('${s.invoice}')">Lihat/Cetak</button><button class="action delete" onclick="deleteSale('${s.invoice}')">Hapus</button></td></tr>`).join("")||'<tr><td colspan="6">Belum ada transaksi.</td></tr>'
}
function openReceiptById(inv){const s=db.sales.find(x=>x.invoice===inv);if(s)openReceipt(s)}
function openReceipt(s){
 document.getElementById("modalContent").innerHTML=`<div class="receipt" id="printReceipt"><h2>${esc(db.settings.storeName)}</h2><p>${esc(db.settings.address)}<br>${esc(db.settings.phone)}</p><hr><p>${esc(s.invoice)}<br>${new Date(s.date).toLocaleString("id-ID")}<br>Pelanggan: ${esc(s.customer)}</p><hr>${s.items.map(i=>`<div class="receipt-line"><span>${esc(i.name)} x${i.qty}</span><span>${rupiah(i.price*i.qty)}</span></div>`).join("")}<hr><div class="receipt-line"><span>Subtotal</span><span>${rupiah(s.subtotal)}</span></div><div class="receipt-line"><span>Diskon</span><span>-${rupiah(s.discount)}</span></div><div class="receipt-line"><span>Pajak</span><span>${rupiah(s.tax)}</span></div><div class="receipt-line receipt-total"><span>TOTAL</span><span>${rupiah(s.total)}</span></div><div class="receipt-line"><span>${esc(s.payment)}</span><span>Bayar ${rupiah(s.paid)}</span></div><div class="receipt-line"><span>Kembalian</span><span>${rupiah(s.change)}</span></div><hr><p>${esc(db.settings.footer)}</p></div><div class="form-actions"><button class="secondary" onclick="closeModal()">Tutup</button><button class="primary" onclick="printReceipt()">🖨 Cetak</button></div>`;document.getElementById("modal").classList.add("show")
}
function printReceipt(){const html=document.getElementById("printReceipt").outerHTML,w=window.open("","_blank","width=420,height=700");w.document.write(`<html><head><title>Struk</title><style>body{font-family:monospace;padding:20px}.receipt{max-width:380px;margin:auto}.receipt h2,.receipt p{text-align:center}.receipt hr{border:0;border-top:1px dashed #555}.receipt-line{display:flex;justify-content:space-between;margin:5px 0}.receipt-total{font-weight:bold;font-size:17px}</style></head><body>${html}</body></html>`);w.document.close();w.print()}
function deleteSale(inv){if(confirm("Hapus transaksi ini? Stok tidak dikembalikan otomatis.")){db.sales=db.sales.filter(s=>s.invoice!==inv);save();renderReceipts();}}
function clearAllSales(){if(confirm("Hapus seluruh riwayat transaksi?")){db.sales=[];save();renderReceipts();}}
function renderReports(){
 const from=document.getElementById("reportFrom").value,to=document.getElementById("reportTo").value;
 const sales=db.sales.filter(s=>(!from||s.date.slice(0,10)>=from)&&(!to||s.date.slice(0,10)<=to)),ex=db.expenses.filter(e=>(!from||e.date>=from)&&(!to||e.date<=to));
 const salesTotal=sales.reduce((a,s)=>a+s.total,0),hpp=sales.reduce((a,s)=>a+s.items.reduce((x,i)=>x+i.buy*i.qty,0),0),exp=ex.reduce((a,e)=>a+e.amount,0);
 document.getElementById("reportSales").textContent=rupiah(salesTotal);document.getElementById("reportHpp").textContent=rupiah(hpp);document.getElementById("reportExpense").textContent=rupiah(exp);document.getElementById("reportProfit").textContent=rupiah(salesTotal-hpp-exp);
 const map={};sales.forEach(s=>s.items.forEach(i=>{if(!map[i.name])map[i.name]={qty:0,sales:0};map[i.name].qty+=i.qty;map[i.name].sales+=i.price*i.qty}));const best=Object.entries(map).sort((a,b)=>b[1].qty-a[1].qty).slice(0,10);
 document.getElementById("bestProducts").innerHTML=best.map(([n,v])=>`<tr><td>${esc(n)}</td><td>${v.qty}</td><td>${rupiah(v.sales)}</td></tr>`).join("")||'<tr><td colspan="3">Belum ada data.</td></tr>';
 const pm={};sales.forEach(s=>pm[s.payment]=(pm[s.payment]||0)+s.total);document.getElementById("paymentSummary").innerHTML=Object.entries(pm).map(([k,v])=>`<div class="low-item"><span>${esc(k)}</span><b>${rupiah(v)}</b></div>`).join("")||"<p>Belum ada data.</p>"
}
function printReport(){const area=document.querySelector("#laporan").innerHTML,w=window.open("","_blank");w.document.write(`<html><head><title>Laporan Toko</title><style>body{font-family:Arial;padding:25px}button,input{display:none}.cards{display:flex;gap:10px}.card{border:1px solid #ddd;padding:12px}.panel{border:1px solid #ddd;padding:15px;margin:10px 0}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}</style></head><body>${area}</body></html>`);w.document.close();w.print()}
function loadSettings(){setStoreName.value=db.settings.storeName;setAddress.value=db.settings.address;setPhone.value=db.settings.phone;setFooter.value=db.settings.footer}
function saveSettings(){db.settings={storeName:setStoreName.value||"Toko Komplit",address:setAddress.value,phone:setPhone.value,footer:setFooter.value};save();document.getElementById("storeNameSide").textContent=db.settings.storeName.toUpperCase();notify("Pengaturan disimpan.")}
function backupData(){const blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`backup-ekasir-${today()}.json`;a.click();URL.revokeObjectURL(a.href)}
function importData(ev){const file=ev.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.products||!x.sales)throw Error();db=x;save();location.reload()}catch{notify("File backup tidak valid.")}};r.readAsText(file)}
function resetData(){if(confirm("PERINGATAN: seluruh produk, transaksi, dan pengeluaran akan dihapus. Lanjutkan?")){localStorage.removeItem(KEY);location.reload()}}
function exportProducts(){const rows=[["Kode","Nama","Kategori","Stok","Min","Harga Beli","Harga Jual"],...db.products.map(p=>[p.code,p.name,p.category,p.stock,p.min,p.buy,p.sell])];const csv=rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n"),a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="data-stok.csv";a.click()}
function closeModal(){document.getElementById("modal").classList.remove("show")}
document.getElementById("modal").onclick=e=>{if(e.target.id==="modal")closeModal()}
function init(){document.getElementById("storeNameSide").textContent=db.settings.storeName.toUpperCase();const d=new Date();document.getElementById("reportFrom").value=d.toISOString().slice(0,8)+"01";document.getElementById("reportTo").value=today();setInterval(()=>document.getElementById("clock").textContent=new Date().toLocaleString("id-ID"),1000);renderDashboard()}
init();