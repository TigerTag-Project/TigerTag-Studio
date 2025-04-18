// Fonction pour remplir un select avec des options
const populateSelect = (id, options) => {
  const select = document.getElementById(id);
  select.innerHTML = ''; // Vider le contenu existant

  // Si c'est le select materialId, ajouter une option par défaut
  if (id === 'materialId') {
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.text = "Select Material";
    select.appendChild(defaultOption);
  }
  
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.id;
    option.text = opt.label || opt.name || opt.version || `ID ${opt.id}`;
    if (id === 'materialId' && opt.recommended) {
      option.setAttribute('data-nozzleTempMin', opt.recommended.nozzleTempMin);
      option.setAttribute('data-nozzleTempMax', opt.recommended.nozzleTempMax);
      option.setAttribute('data-dryTemp', opt.recommended.dryTemp);
      option.setAttribute('data-dryTime', opt.recommended.dryTime);
    }

    // Pour le select brandId, pré-sélectionner l'option "Generic" (id 65535)
    if (id === 'brandId' && opt.id === 65535) {
      option.selected = true;
    }
     // Pour le select unitId, pré-sélectionner l'option { id: 21, label: 'g', type: 'weight' }
     if (id === 'unitId' && opt.id === 21) {
      option.selected = true;
    }
       // Pour le select typeID, pré-sélectionner l'option { id: 142, "label": 'Filament' }
       if (id === 'typeId' && opt.id === 142) {
        option.selected = true;
      }

      // Pour le select aspect1Id, pré-sélectionner l'option { id: 104, "label": 'Basic' } 
      if (id === 'aspect1Id' && opt.id === 104) {
        option.selected = true;
      }

      // Pour le select aspect2Id, pré-sélectionner l'option { id: 255, "label": 'none' } 
      if (id === 'aspect2Id' && opt.id === 255) {
        option.selected = true;
      }
    
    select.appendChild(option);
  });
};

// Fonction de chargement de données pour un select
const loadDBSelectData = async (selectId, key) => {
  try {
    const response = await window.electronAPI.loadDBData(key);
    if (response.success && Array.isArray(response.data)) {
      populateSelect(selectId, response.data);
    } else {
      console.error(`No data for ${key}:`, response.error);
    }
  } catch (error) {
    console.error(`Error loading data for ${key}:`, error);
  }
};

// Fonction de chargement initial
const initMakePage = async () => {
document.getElementById('loading').style.display = 'none';
document.getElementById('mainContentForm').style.display = 'block';

  await loadDBSelectData('brandId', 'brandId');
  await loadDBSelectData('materialId', 'materialId');

  await loadDBSelectData('aspect1Id', 'aspectId');
  await loadDBSelectData('aspect2Id', 'aspectId');
  // await loadDBSelectData('versionId', 'versionId');
  await loadDBSelectData('typeId', 'typeId');
  await loadDBSelectData('diameterId', 'diameterId');
  await loadDBSelectData('unitId', 'unitId');

   // Ajout de l'écouteur sur le select "materialId"
   document.getElementById('materialId').addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const nozzleTempMin = selectedOption.getAttribute('data-nozzleTempMin');
    const nozzleTempMax = selectedOption.getAttribute('data-nozzleTempMax');
    const dryTemp = selectedOption.getAttribute('data-dryTemp');
    const dryTime = selectedOption.getAttribute('data-dryTime');
    
    if (nozzleTempMin) document.getElementById('tempMin').value = nozzleTempMin;
    if (nozzleTempMax) document.getElementById('tempMax').value = nozzleTempMax;
    if (dryTemp) document.getElementById('dryTemp').value = dryTemp;
    if (dryTime) document.getElementById('dryTime').value = dryTime;
  });

  // Attacher les événements de soumission du formulaire
  const form = document.getElementById('tagForm');
  // Pour éviter d'attacher plusieurs fois le même écouteur
  if (!form.dataset.initialized) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Vérifier que le champ "materialId" a une valeur (non null)
        const materialIdValue = document.getElementById('materialId').value;
        if (!materialIdValue) {
          alert("Please select a material before writing the tag.");
          return; // On empêche l'envoi du formulaire
        }


        // Récupérer la couleur RGB depuis l'input (ex: "#FF0000")
        const colorRGB = parseInt(document.getElementById('color').value.replace('#',''), 16);
        // Récupérer la valeur alpha selon la case "transparent"
        // Si cochée, alpha = 75, sinon 255.
        const alpha = document.getElementById('transparent').checked ? 75 : 255;
        // Combiner le RGB sur 3 octets avec l'alpha sur le 4ème octet
        const color = (colorRGB << 8) | alpha;


        const formData = {
          tigerTagID: 1542820452,
          productID: 4294967295,
          materialID: parseInt(document.getElementById('materialId').value, 10),
          aspect1ID: parseInt(document.getElementById('aspect1Id').value, 10),
          aspect2ID: parseInt(document.getElementById('aspect2Id').value || '0', 10),
          typeID: parseInt(document.getElementById('typeId').value, 10),
          diameterID: parseInt(document.getElementById('diameterId').value, 10),
          brandID: parseInt(document.getElementById('brandId').value, 10),
          color: color, // Valeur 32-bit combinant RGB et alpha
          weight: parseInt(document.getElementById('weight').value, 10),
          unitId: parseInt(document.getElementById('unitId').value, 10),
          tempMin: parseInt(document.getElementById('tempMin').value, 10),
          tempMax: parseInt(document.getElementById('tempMax').value, 10),
          dryTemp: parseInt(document.getElementById('dryTemp').value, 10),
          dryTime: parseInt(document.getElementById('dryTime').value, 10),
          transparent: document.getElementById('transparent').checked ? 75 : 255
        };
        console.log('[make.js] Sending formData to main:', formData);
        const result = await window.electronAPI.makeTag(formData);

        if (result.success) {
          alert('✅ Tag written successfully!');
        } else {
          alert(`❌ Error: ${result.error}`);
        }
        
    });

    // Bouton reset
    document.getElementById('resetTagBtn').addEventListener('click', async () => {
        const zeroFormData = {
          tigerTagID: 1816240865, // TigerTag ID = TigerTag Init Version V1.0
          productID: 0,
          materialID: 0,
          aspect1ID: 0,
          aspect2ID: 0,
          typeID: 0,
          diameterID: 0,
          brandID: 0,
          color: 0,
          transparent: 0,
          weight: 0,
          unitId: 0,
          tempMin: 0,
          tempMax: 0,
          dryTemp: 0,
          dryTime: 0,
          timeStamp: 0
        };
        console.log('[make.js] Sending reset formData:', zeroFormData);
        const result = await window.electronAPI.makeTag(zeroFormData);
        document.getElementById('status').innerText = result.success
          ? 'Tag reset to all zeros!'
          : `Reset Error: ${result.error}`;
          alert("TigerTag Reset.");
          
    });

    // Dans la fonction initMakePage(), remplacez les écouteurs des boutons presets par :

// Bouton Polymaker
document.getElementById('polymakerBtn').addEventListener('click', async () => {
  const presetData = {
      tigerTagID: 3155151767, // TigerTag Pro V1.0
      productID: 10,
      materialID: 38219, // PLA
      aspect1ID: 247, // Basic
      aspect2ID: 0, // none
      typeID: 142, // Filament
      diameterID: 56, // 1.75mm
      brandID: 50604, // Polymaker
      color: 0x89d9d9, // Artic Teal
      weight: 1000, // 1kg
      unitId: 21, // g
      tempMin: 190,
      tempMax: 240,
      dryTemp: 45,
      dryTime: 6,
  };
  console.log('[make.js] Sending Polymaker preset:', presetData);
  const result = await window.electronAPI.makeTag(presetData);
  document.getElementById('status').innerText = result.success
      ? 'Polymaker preset applied successfully!'
      : `Error: ${result.error}`;
  if (result.success) alert("Polymaker preset applied!");
});

// Bouton Elegoo
document.getElementById('elegooBtn').addEventListener('click', async () => {
  const presetData = {
      tigerTagID: 3155151767, // TigerTag Pro V1.0
      productID: 20,
      materialID: 43518, // TPU
      aspect1ID: 104,
      aspect2ID: 255,
      typeID: 142,
      diameterID:  56, // 1.75mm
      brandID: 57632, // Elegoo
      color: 0x000000FF, // Black
      weight: 1000,
      unitId: 21,
      tempMin: 200,
      tempMax: 250,
      dryTemp: 75,
      dryTime: 8,
  };

  console.log('[make.js] Sending Elegoo preset:', presetData);
  const result = await window.electronAPI.makeTag(presetData);
  document.getElementById('status').innerText = result.success
      ? 'Elegoo preset applied successfully!'
      : `Error: ${result.error}`;
  if (result.success) alert("Elegoo preset applied!");
});

// Bouton R3D
document.getElementById('r3dBtn').addEventListener('click', async () => {
  const presetData = {
    tigerTagID: 3155151767, // TigerTag Pro V1.0
    productID: 30,
    materialID: 48310, // PLA
    aspect1ID: 238,
    aspect2ID: 0,
    typeID: 142,
    diameterID: 56, // 1.75mm
    brandID: 48804, // R3D
    color: 0x151515FF, // Ash Grey
    weight: 1000,
    unitId: 21,
    tempMin: 210,
    tempMax: 240,
    dryTemp: 55,
    dryTime: 6,
  };

  console.log('[make.js] Sending R3D preset:', presetData);
  const result = await window.electronAPI.makeTag(presetData);
  document.getElementById('status').innerText = result.success
      ? 'R3D preset applied successfully!'
      : `Error: ${result.error}`;
  if (result.success) alert("R3D preset applied!");
});

// Bouton Sunlu
document.getElementById('sunluBtn').addEventListener('click', async () => {
  const presetData = {
    tigerTagID: 3155151767, // TigerTag Pro V1.0
    productID: 40,
    materialID: 12, // PLA
    aspect1ID: 104,
    aspect2ID: 255,
    typeID: 142,
    diameterID: 56, // 1.75mm
    brandID: 51857, // Sunlu
    color: 0x00FF00FF, // Vert opaque
    weight: 1000,
    unitId: 21,
    tempMin: 195,
    tempMax: 215,
    dryTemp: 45,
    dryTime: 6,
  };

  console.log('[make.js] Sending Sunlu preset:', presetData);
  const result = await window.electronAPI.makeTag(presetData);
  document.getElementById('status').innerText = result.success
      ? 'Sunlu preset applied successfully!'
      : `Error: ${result.error}`;
  if (result.success) alert("Sunlu preset applied!");
});

// Bouton eSun
document.getElementById('esunBtn').addEventListener('click', async () => {
  const presetData = {
    tigerTagID: 3155151767, // TigerTag Pro V1.0
    productID: 50,
    materialID: 99, // PLA+
    aspect1ID: 104,
    aspect2ID: 255,
    typeID: 142,
    diameterID: 56, // 1.75mm
    brandID: 47930, // eSun
    color: 0x00C389FF, // JADE GREEN
    weight: 1000,
    unitId: 21,
    tempMin: 210,
    tempMax: 230,
    dryTemp: 50,
    dryTime: 8
  };
  
  console.log('[make.js] Sending eSun preset:', presetData);
  const result = await window.electronAPI.makeTag(presetData);
  document.getElementById('status').innerText = result.success
      ? 'eSun preset applied successfully!'
      : `Error: ${result.error}`;
  if (result.success) alert("eSun preset applied!");
});

// Bouton Rosa3D
document.getElementById('rosa3dBtn').addEventListener('click', async () => {
  const presetData = {
    tigerTagID: 3155151767, // TigerTag Pro V1.0
    productID: 60,
    materialID: 38219, // PLA
    aspect1ID: 92, // Silk
    aspect2ID: 24, // Tricolor
    typeID: 142,
    diameterID: 56, // 1.75mm
    brandID: 47930, // Rosa3D
    color: 0x1532A6FF, // Carnival
    weight: 1000,
    unitId: 21,
    tempMin: 195,
    tempMax: 235,
    dryTemp: 50,
    dryTime: 4
  };

  console.log('[make.js] Sending Rosa3D preset:', presetData);
  const result = await window.electronAPI.makeTag(presetData);
  document.getElementById('status').innerText = result.success
      ? 'Rosa3D preset applied successfully!'
      : `Error: ${result.error}`;
  if (result.success) alert("Rosa3D preset applied!");
});

    form.dataset.initialized = true;
  }
};

// Exposer la fonction pour pouvoir la réinitialiser quand nécessaire
window.initMakePage = initMakePage;

// Auto-initialisation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMakePage);
} else {
  initMakePage();
}