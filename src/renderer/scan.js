document.getElementById('scanActionBtn').addEventListener('click', async () => {
  const resultDiv = document.getElementById('scanResult');
  resultDiv.innerHTML = "Scanning...";

  try {
    const tagData = await window.electronAPI.readTag();

    console.log("Tag data reçu :", tagData);
    console.log("UID numérique du tag :", tagData.uidNumeric);

    if (tagData.tigerTagID === 3155151767) {
      // Mode TigerTag Pro (online)
      const uidNumeric = tagData.uidNumeric;
      const product_id = tagData.productIdDecimal;
      const apiURL = `https://api.tigertag.io/api:tigertag/product/filament/get?uid=${uidNumeric}&product_id=${product_id}`;

      try {
        const apiResponse = await fetch(apiURL);
        if (!apiResponse.ok) throw new Error("Réponse API invalide");

        const apiData = await apiResponse.json();
        resultDiv.innerHTML = renderOnlineData(apiData, uidNumeric, tagData.timeStampReadable);

      } catch (apiError) {
        console.warn("Échec de l'API, fallback offline :", apiError);
        resultDiv.innerHTML = await renderOfflineData(tagData);
      }
    } else {
      // Mode TigerTag Maker (offline)
      resultDiv.innerHTML = await renderOfflineData(tagData);
    }

  } catch (err) {
    console.error("Erreur de scan :", err);
    resultDiv.innerHTML = `<p>Erreur lors du scan : ${err.message}</p>`;
  }
});

// === AFFICHAGE OFFLINE (TigerTag Maker) ===
async function renderOfflineData(tagData) {
  tagData.versionLabel = await lookupLabel('versionId', tagData.tigerTagID);
  tagData.materialLabel = await lookupLabel('materialId', tagData.materialID);
  tagData.aspect1Label = await lookupLabel('aspectId', tagData.aspect1ID);
  tagData.aspect2Label = await lookupLabel('aspectId', tagData.aspect2ID);
  tagData.typeLabel = await lookupLabel('typeId', tagData.typeID);
  tagData.diameterLabel = await lookupLabel('diameterId', tagData.diameterID);
  tagData.brandLabel = await lookupLabel('brandId', tagData.brandID);
  tagData.unitLabel = await lookupLabel('unitId', tagData.unitId);
  
  const rgbHex = ((tagData.color >>> 8) & 0xFFFFFF).toString(16).padStart(6, '0');
  const colorHex = '#' + rgbHex;
  const r = (tagData.color >> 24) & 0xFF;
  const g = (tagData.color >> 16) & 0xFF;
  const b = (tagData.color >> 8) & 0xFF;
  const a = (tagData.color & 0xFF);

  return `
<div class="scan-result-card-offline">
  <h3>TigerTag Maker (Offline)</h3>
  <p><strong>Tag ID:</strong> ${tagData.uidNumeric}</p>
  <p><strong>Version:</strong> ${tagData.versionLabel || 'N/A'} (ID : ${tagData.tigerTagID})</p>
  <p><strong>ProductID:</strong> ${tagData.productIdDecimal ?? 'N/A'} (${tagData.productID.join(' ')})</p>
  <p><strong>Material:</strong> ${tagData.materialLabel || 'N/A'} (ID : ${tagData.materialID})</p>
  <p><strong>Aspect 1:</strong> ${tagData.aspect1Label || 'N/A'} (ID : ${tagData.aspect1ID})</p>
  <p><strong>Aspect 2:</strong> ${tagData.aspect2Label || 'N/A'} (ID : ${tagData.aspect2ID})</p>
  <p><strong>Type:</strong> ${tagData.typeLabel || 'N/A'} (ID : ${tagData.typeID})</p>
  <p><strong>Diameter:</strong> ${tagData.diameterLabel || 'N/A'} (ID : ${tagData.diameterID})</p>
  <p><strong>Brand:</strong> ${tagData.brandLabel || 'N/A'} (ID : ${tagData.brandID})</p>
  <p>
    <strong>Color:</strong>
    <input type="color" value="${colorHex}" disabled />
    ${colorHex} : RGBA(${r},${g},${b},${a})
  </p>
  <p><strong>Weight:</strong> ${tagData.weightValue !== undefined ? tagData.weightValue : 'N/A'}</p>
  <p><strong>Unit:</strong> ${tagData.unitLabel || 'N/A'} (ID : ${tagData.unitId})</p>
  <p><strong>Temp Min:</strong> ${tagData.tempMin} °C</p>
  <p><strong>Temp Max:</strong> ${tagData.tempMax} °C</p>
  <p><strong>Dry Temp:</strong> ${tagData.dryTemp} °C</p>
  <p><strong>Dry Time:</strong> ${tagData.dryTime} h</p>
  <p><strong>TimeStamp:</strong> ${tagData.timeStampReadable ?? 'Not set'}</p>
</div>
  `;
}

// === AFFICHAGE ONLINE (TigerTag Pro) ===
function renderOnlineData(apiData, uidNumeric, offlineTimestamp) {

  const rawColor = apiData.filament.color.startsWith('#')
  ? apiData.filament.color.slice(1)
  : apiData.filament.color;

const colorHex = `#${rawColor.substring(0, 6)}`;
const r = parseInt(rawColor.substring(0, 2), 16);
const g = parseInt(rawColor.substring(2, 4), 16);
const b = parseInt(rawColor.substring(4, 6), 16);
const a = rawColor.length === 8 ? parseInt(rawColor.substring(6, 8), 16) : 255;

  const timestamp = offlineTimestamp || 'Not set';

  return `
      <div class="scan-result-card">
      <h3 class="result-title">TigerTag Pro (Online)</h3>
      <p class="result-line"><strong>Tag ID:</strong> ${uidNumeric}</p>
      <p><img src="${apiData.images.main_src}" alt="Product image" class="result-image" /></p>
      <p class="result-line"><strong>Title:</strong> ${apiData.title}</p>
      <p class="result-line"><strong>Name:</strong> ${apiData.name}</p>
      <p class="result-line"><strong>Brand:</strong> ${apiData.brand}</p>
      <p class="result-line"><strong>Series:</strong> ${apiData.series}</p>
      <p class="result-line"><strong>Material:</strong> ${apiData.filament.material}</p>
      <p class="result-line"><strong>Aspect 1:</strong> ${apiData.filament.aspect1}</p>
      <p class="result-line"><strong>Aspect 2:</strong> ${apiData.filament.aspect2}</p>
      <p class="result-line"><strong>Shore:</strong> ${apiData.filament.shore}</p>
      <p class="result-line"><strong>Diameter:</strong> ${apiData.filament.diameter} mm</p>
      <p class="result-line"><strong>Weight:</strong> ${apiData.filament.weight} ${apiData.filament.weight_unit}</p>
      <p class="result-line"><strong>Recycled:</strong> ${apiData.filament.recycled ? '✅' : 'No'}</p>
      <p class="result-line"><strong>Refill:</strong> ${apiData.filament.refill ? '✅' : 'No'}</p>
      <p class="result-line"><strong>Filled:</strong> ${apiData.filament.filled ? '✅' : 'No'}</p>
      <p class="result-line">
        <strong>Color:</strong>
        <input type="color" value="${colorHex}" disabled class="color-chip" />
        ${colorHex} : RGBA(${r}, ${g}, ${b}, ${a})<br/>
      </p>
      <p class="result-line"><strong>Color Type:</strong> ${apiData.filament.color_info?.type || 'N/A'}</p>
      <p class="result-line"><strong>Transmission Dist:</strong> ${apiData.filament.transmission_dist}</p>
      <p class="result-line"><strong>Color List:</strong> ${(apiData.filament.color_info?.colors || []).filter(Boolean).join(', ')}</p>
      <p class="result-line"><strong>Drying:</strong> ${apiData.dryer.temp} °C for ${apiData.dryer.time} hours</p>
      <p class="result-line"><strong>Nozzle min:</strong> ${apiData.nozzle.temp_min} °C /<strong>Nozzle max:</strong> ${apiData.nozzle.temp_max} °C</p>
      <p class="result-line"><strong>Temp min:</strong> ${apiData.bed.temp_min} °C /<strong>Temp max:</strong> ${apiData.bed.temp_max} °C</p>
      <p class="result-line"><strong>Fan min:</strong> ${apiData.fan.speed_min} % /<strong>Fan max:</strong> ${apiData.fan.speed_max} %</p>
      <p class="result-line"><strong>SKU:</strong> ${apiData.sku}</p>
      <p class="result-line"><strong>Barcode:</strong> ${apiData.barcode}</p>
      <p class="result-line"><strong>Bambu ID:</strong> ${apiData.metadata.bambuLabel} (${apiData.metadata.bambuID})</p>
      <p class="result-line"><strong>Creality ID:</strong> ${apiData.metadata.crealityLabel} (${apiData.metadata.crealityID})</p>
      <p><strong>TimeStamp:</strong> ${timestamp}</p>
      <p class="result-line"><strong>Documents:</strong>
        <ul>
          <li><a href="${apiData.links.tds}" target="_blank">TDS</a></li>
          <li><a href="${apiData.links.msds}" target="_blank">MSDS</a></li>
          <li><a href="${apiData.links.rohs}" target="_blank">RoHS</a></li>
          <li><a href="${apiData.links.reach}" target="_blank">REACH</a></li>
          <li><a href="${apiData.links.tips}" target="_blank">Tips</a></li>
          <li><a href="${apiData.links.youtube}" target="_blank">YouTube</a></li>
        </ul>
      </p>
      
    </div>
  `;
}

async function lookupLabel(dbKey, id) {
  try {
    const response = await window.electronAPI.loadDBData(dbKey);
    if (response.success && Array.isArray(response.data)) {
      const entry = response.data.find(item => Number(item.id) === Number(id));
      if (entry) {
        if (dbKey === 'versionId') return entry.name;
        return entry.label || entry.name;
      }
    } else {
      console.warn(`No data for ${dbKey}:`, response.error);
    }
  } catch (error) {
    console.error(`IPC Error in lookupLabel(${dbKey}, ${id}):`, error);
  }
  return null;
}