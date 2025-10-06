// ⚠️ Mets ici l’URL "Version déployée" de ton Apps Script Web App (voir étapes)
const ENDPOINT = https://script.google.com/macros/s/AKfycbzF3P3AE1hcHuyFRZLnBS9eKtu0nz1jVyLxv8Ej0CbA78G-_ssXd2e-I9zgk58qqke46w/exec;

const $ = id => document.getElementById(id);
const blocs = {
  "Achat stock":"bloc-achat",
  "Frais annexes":"bloc-frais",
  "Vente/Cashout":"bloc-vente",
  "Abonnement (mensuel)":"bloc-abo",
  "Paiement perso":"bloc-paiement"
};

function switchTypeUI(){
  const t=$("type").value;
  Object.values(blocs).forEach(id=>$(id).classList.add("hidden"));
  $(blocs[t]).classList.remove("hidden");
}
$("type").addEventListener("change", switchTypeUI);

function fillSelect(sel, arr){ sel.innerHTML=""; (arr||[]).forEach(v=>{const o=document.createElement("option"); o.value=o.textContent=v; sel.appendChild(o);}); }

async function loadLists(){
  try{
    const r=await fetch(ENDPOINT+"?api=lists");
    const {ok,data,error}=await r.json();
    if(!ok) throw new Error(error||"Échec listes");
    fillSelect($("payeur-achat"), data.personnes);
    fillSelect($("fournisseur"), data.fournisseurs);
    fillSelect($("payeur-frais"), data.personnes);
    fillSelect($("categorie"), data.categories);
    fillSelect($("compte-vinted"), data.comptesVinted);
    fillSelect($("vendeur"), data.personnes);
    fillSelect($("abo-categorie"), data.categories);
    fillSelect($("abo-payeur"), data.personnes);
    fillSelect($("payeur-perso"), data.personnes);
  }catch(e){
    $("error").textContent="Erreur listes: "+e.message; $("error").style.display="block";
  }
}

// + ajouter (Paramètres) via form-urlencoded
document.body.addEventListener("click", async (e)=>{
  if(!e.target.matches(".add-link")) return;
  const kind=e.target.getAttribute("data-kind");
  const labels={categorie:"Nouvelle catégorie",fournisseur:"Nouveau fournisseur",compteVinted:"Nouveau compte Vinted"};
  const val=prompt((labels[kind]||"Nouvelle valeur")+" :");
  if(!val) return;
  try{
    const form = new URLSearchParams();
    form.append("action","addParam");
    form.append("kind", kind);
    form.append("value", val);
    const r = await fetch(ENDPOINT,{ method:"POST", headers:{ "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8" }, body:form.toString() });
    const {ok,data,error}=await r.json();
    if(!ok) throw new Error(error||"Échec ajout");
    if(kind==='fournisseur') fillSelect($("fournisseur"), data.fournisseurs||[]);
    if(kind==='categorie'){ fillSelect($("categorie"), data.categories||[]); fillSelect($("abo-categorie"), data.categories||[]); }
    if(kind==='compteVinted') fillSelect($("compte-vinted"), data.comptesVinted||[]);
  }catch(err){ alert("Erreur: "+err.message); }
});

(function setToday(){
  const t=new Date(), yyyy=t.getFullYear(), mm=String(t.getMonth()+1).padStart(2,"0"), dd=String(t.getDate()).padStart(2,"0");
  $("date-achat").value=`${yyyy}-${mm}-${dd}`;
  $("date-frais").value=`${yyyy}-${mm}-${dd}`;
  $("date-vente").value=`${yyyy}-${mm}-${dd}`;
  $("date-paiement").value=`${yyyy}-${mm}-${dd}`;
})();

$("submit").addEventListener("click", async ()=>{
  $("submit").disabled=true; $("feedback").style.display="none"; $("error").style.display="none";
  const type=$("type").value; const p={ type };

  if(type==="Achat stock"){
    p.item=$("item").value; p.dateISO=$("date-achat").value; p.montant=$("montant-achat").value; p.fournisseur=$("fournisseur").value; p.payeur=$("payeur-achat").value;
  } else if(type==="Frais annexes"){
    p.fraisDesc=$("frais-desc").value; p.dateISO=$("date-frais").value; p.montant=$("montant-frais").value; p.categorie=$("categorie").value; p.payeur=$("payeur-frais").value;
  } else if(type==="Vente/Cashout"){
    p.dateISO=$("date-vente").value; p.montant=$("montant-vente").value; p.compteVinted=$("compte-vinted").value; p.vendeur=$("vendeur").value;
  } else if(type==="Abonnement (mensuel)"){
    p.aboNom=$("abo-nom").value; p.montant=$("abo-montant").value; p.aboJour=$("abo-jour").value; p.categorie=$("abo-categorie").value; p.payeur=$("abo-payeur").value; p.aboActif=$("abo-actif").checked;
  } else {
    p.dateISO=$("date-paiement").value; p.montant=$("montant-paiement").value; p.personne=$("payeur-perso").value;
  }

  try{
    const form=new URLSearchParams(); for(const [k,v] of Object.entries(p)) form.append(k,String(v));
    const r=await fetch(ENDPOINT,{ method:"POST", headers:{ "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8" }, body:form.toString() });
    const json=await r.json().catch(()=>({}));
    if(!r.ok || json.ok===false) throw new Error(json.error || ("HTTP "+r.status));
    $("feedback").textContent="Ajouté ✅"; $("feedback").style.display="block";
    if(type==="Achat stock"){ $("item").value=""; $("montant-achat").value=""; }
    else if(type==="Frais annexes"){ $("frais-desc").value=""; $("montant-frais").value=""; }
    else if(type==="Vente/Cashout"){ $("montant-vente").value=""; }
    else if(type==="Abonnement (mensuel)"){ $("abo-nom").value=""; $("abo-montant").value=""; }
    else { $("montant-paiement").value=""; }
  }catch(e){
    $("error").textContent="Erreur: "+e.message; $("error").style.display="block";
  }finally{ $("submit").disabled=false; }
});

switchTypeUI();
loadLists();
