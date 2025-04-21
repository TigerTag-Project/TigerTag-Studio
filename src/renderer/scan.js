document.getElementById('scanActionBtn').addEventListener('click', async () => {
  const resultDiv = document.getElementById('scanResult');
  resultDiv.innerHTML = "<legend>Scanning...</legend>";

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
<legend>TigerTag Maker (Offline)</legend>
<div class="testcss-card">
<div class="testcss-card-header">
      <span class="testcss-card-name">${tagData.brandLabel || 'N/A'} - ${tagData.materialLabel || 'N/A'}<span>
</div>
    <div class="testcss-card-body">
      <div class="testcss-image">
        <img src="../assets/svg/tigertag_logo_b&w.svg" alt="Product image">
        <span class="label">${tagData.typeLabel || 'N/A'}</span>
        </div>
      <div class="testcss-info">
        <div class="testcss-row">
          <span class="label">Material:</span>
          <span class="value">${tagData.materialLabel || 'N/A'}</span>
        </div>
        <div class="testcss-row">
          <span class="label">Aspect:</span>
          <span class="value">${tagData.aspect1Label || 'N/A'} / ${tagData.aspect2Label || 'N/A'}</span>
        </div>
        <div class="testcss-row">
          <span class="label">Weight:</span>
          <span class="value">${tagData.weightValue !== undefined ? tagData.weightValue : 'N/A'} ${tagData.unitLabel || 'N/A'}</span>
        </div>
        <div class="testcss-row">
          <span class="label">Diameter:</span>
          <span class="value">${tagData.diameterLabel || 'N/A'} mm</span>
        </div>
        <!-- Bloc couleur juste sous les flags -->
        <div class="testcss-color">
          <div class="swatch" style="background: ${colorHex};"></div>
          <div class="testcss-color-values">
            <div class="testcss-row">
              <span class="label">Hex:</span>
              <span class="value">${colorHex}</span>
            </div>
            <div class="testcss-row">
              <span class="label">RGBA:</span>
              <span class="value">${r}, ${g}, ${b}, ${a}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="testcss-card-footer">
      <button>▼ Additional Information ▼</button>
    </div>
</div>
<!-- fin test css-card -->




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
    <input type="color" class="custom-color" value="${colorHex}" disabled />
    ${colorHex} : RGBA(${r},${g},${b},${a})
  </p>
  <p><strong>Weight:</strong> ${tagData.weightValue !== undefined ? tagData.weightValue : 'N/A'}</p>
  <p><strong>Unit:</strong> ${tagData.unitLabel || 'N/A'} (ID : ${tagData.unitId})</p>
  <p><strong>Temp Min:</strong> ${tagData.tempMin} °C</p>
  <p><strong>Temp Max:</strong> ${tagData.tempMax} °C</p>
  <p><strong>Dry Temp:</strong> ${tagData.dryTemp} °C</p>
  <p><strong>Dry Time:</strong> ${tagData.dryTime} h</p>
  <p><strong>TimeStamp:</strong> ${tagData.timeStampReadable ?? 'Not set'}</p>
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

  
  // Déclaration des variables de rendu conditionnel
  const legendRenderer = 'TigerTag Pro (Online)';
  const uidRenderer = `<p class="result-line"><strong>Tag ID:</strong> ${uidNumeric}</p>`;
  const mainImgRenderer = `apiData.images.main_src.main_src`? `${apiData.images.main_src}` : '';
  const titleRenderer = apiData.title ? `${apiData.title}` : '';
  const nameRenderer = apiData.name ? `${apiData.name}` : '';
  const brandRenderer = apiData.brand ? `${apiData.brand}` : '';
  const seriesRenderer = apiData.series ? `${apiData.series}` : '';
  const filamentRenderer = apiData.filament ? 'Filament' : '';
  const materialRenderer = apiData.filament.material ? `${apiData.filament.material}` : '';
  const aspect1Renderer = apiData.filament.aspect1 ? `${apiData.filament.aspect1}` : '';
  const aspect2Renderer = apiData.filament.aspect2 ? `/ ${apiData.filament.aspect2}` : '';
  const shoreRenderer = apiData.filament.shore ? `<div class="testcss-row"><span class="label">Shore:</span><span class="value">${apiData.filament.shore}</span></div> ` : '';
  const diameterRenderer = apiData.filament.diameter ? `${apiData.filament.diameter} mm` : '';
  const weightRenderer = apiData.filament.weight ? `${apiData.filament.weight} ${apiData.filament.weight_unit}` : '';
  const recycledRenderer = apiData.filament.recycled ? `✅ Recycled`: ``;
  const refillRenderer = apiData.filament.refill ? `✅ Refill` : ``;
  const filledRenderer = apiData.filament.filled ? `✅ Filled` : ``;
  const colorTypeRenderer = apiData.filament.color_info?.type ? `Color Type: ${apiData.filament.color_info.type}` : '';
  const transdistRenderer = apiData.filament.transmission_dist ? `Transmission Dist: ${apiData.filament.transmission_dist}` : '<p class="result-line"><strong>Transmission Dist:</strong> --</p>';
  const colorListRenderer = apiData.filament.color_info?.colors ? `List:${apiData.filament.color_info.colors.join(', ')}` : '';
  const colorHslaRenderer = apiData.filament.color_info?.hsla ? `HSLA:${apiData.filament.color_info.hsla}` : '';
  const colorRalRenderer = apiData.filament.color_info?.ral ? `RAL:${apiData.filament.color_info.ral}` : '';
  const drytempRenderer = apiData.dryer.temp ? `${apiData.dryer.temp}°C` : '';
  const drytimeRenderer = apiData.dryer.time ? `${apiData.dryer.time}h` : '';
  const nozzleMinRenderer = apiData.nozzle.temp_min ? `${apiData.nozzle.temp_min}°C` : '';
  const nozzleMaxRenderer = apiData.nozzle.temp_max ? `${apiData.nozzle.temp_max}°C` : '';
  const bedMinRenderer = apiData.bed.temp_min ? `${apiData.bed.temp_min}°C` : '';
  const bedMaxRenderer = apiData.bed.temp_max ? `${apiData.bed.temp_max}°C` : '';
  const fanMinRenderer = apiData.fan.speed_min ? `${apiData.fan.speed_min}%` : '';
  const fanMaxRenderer = apiData.fan.speed_max ? `${apiData.fan.speed_max}%` : '';
  const skuRenderer = apiData.sku ? `${apiData.sku}` : '';
  const barcodeRenderer = apiData.barcode ? `${apiData.barcode}` : '';
  const bambuRenderer = apiData.metadata?.bambuLabel && apiData.metadata?.bambuID ? `✅ ${apiData.metadata.bambuLabel}` : '❌';
  const crealityRenderer = apiData.metadata?.crealityLabel && apiData.metadata?.crealityID ? `✅ ${apiData.metadata.crealityLabel}`: '❌';
  const dataLinkTDS = apiData.links.tds ? `<li><a href="${apiData.links.tds}" target="_blank">TDS</a></li>` : '';
  const dataLinkMSDS = apiData.links.msds ? `<li><a href="${apiData.links.msds}" target="_blank">MSDS</a></li>` : '';
  const dataLinkRoHS = apiData.links.rohs ? `<li><a href="${apiData.links.rohs}" target="_blank">RoHS</a></li>` : '';
  const dataLinkREACH = apiData.links.reach ? `<li><a href="${apiData.links.reach}" target="_blank">REACH</a></li>` : '';
  const dataLinkTips = apiData.links.tips ? `<li><a href="${apiData.links.tips}" target="_blank">Tips</a></li>` : '';
  const dataLinkYouTube = apiData.links.youtube ? `<li><a href="${apiData.links.youtube}" target="_blank">YouTube</a></li>` : '';

  
  return `
<!-- test css-card -->

    
<legend>${legendRenderer}</legend>
<div class="testcss-card">
<div class="testcss-card-header">
      <span class="testcss-card-name">${brandRenderer} - ${seriesRenderer} - ${nameRenderer}<span>
</div>
    <div class="testcss-card-body">
      <div class="testcss-image">
        <img src="${mainImgRenderer}" alt="Product image">
        <span class="label">${filamentRenderer}</span>
        </div>
      <div class="testcss-info">
        <div class="testcss-row">
          <span class="label">Material:</span>
          <span class="value">${materialRenderer}</span>
        </div>
        ${shoreRenderer}  <!-- renvoie une <div> complete pour l'insseret dans le tableaux -->
        <div class="testcss-row">
          <span class="label">Aspect:</span>
          <span class="value">${aspect1Renderer} ${aspect2Renderer}</span>
        </div>
        <div class="testcss-row">
          <span class="label">Weight:</span>
          <span class="value">${weightRenderer}</span>
        </div>
        <div class="testcss-row">
          <span class="label">Diameter:</span>
          <span class="value">${diameterRenderer}</span>
        </div>

        <div class="testcss-flags">
          <span class="flag--refill">${refillRenderer}</span>
          <span class="flag--recycled">${recycledRenderer}</span>
          <span class="flag--filled">${filledRenderer}</span>
        </div>

        <!-- Bloc couleur juste sous les flags -->
        <div class="testcss-color">
          <div class="swatch" style="background: ${colorHex};"></div>
          <div class="testcss-color-values">
            <div class="testcss-row">
              <span class="label">Hex:</span>
              <span class="value">${colorHex}</span>
            </div>
            <div class="testcss-row">
              <span class="label">RGBA:</span>
              <span class="value">${r}, ${g}, ${b}, ${a}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="testcss-card-footer">
      <button>▼ Additional Information ▼</button>
    </div>
</div>
<!-- fin test css-card -->
<div class="filament-card__details">
<!-- Subcard Profil Printer -->
<div class="subcard">
  <div class="subcard__header">
    <h4 class="subcard__title">Profil Printer Connected</h4>
    <img src="../assets/svg/thermometer.svg" alt="Printer icon" class="subcard__icon">
  </div>
  <div class="subcard__body">
    <div class="subcard__col">
      <span class="subcard__label">BambuLab</span>
      <span class="subcard__value">${bambuRenderer}</span>
    </div>
    <div class="subcard__col">
      <span class="subcard__label">Creality</span>
      <span class="subcard__value">${crealityRenderer}</span>
    </div>
  </div>
</div>
</div>

<!-- HTML à insérer sous votre bouton “Additional Information” -->
<div class="filament-card__additional">

  <!-- Subcard Nozzle -->
  <div class="subcard">
    <div class="subcard__header">
      <h4 class="subcard__title">Nozzle Temp.</h4>
      <img src="../assets/svg/thermometer.svg" alt="Nozzle icon" class="subcard__icon">
    </div>
    <div class="subcard__body">
      <div class="subcard__col">
        <span class="subcard__label">Min</span>
        <span class="subcard__value">${nozzleMinRenderer}</span>
      </div>
      <div class="subcard__col">
        <span class="subcard__label">Max</span>
        <span class="subcard__value">${nozzleMaxRenderer}</span>
      </div>
    </div>
  </div>

  <!-- Subcard Bed -->
  <div class="subcard">
    <div class="subcard__header">
      <h4 class="subcard__title">Bed Temp.</h4>
      <img src="../assets/svg/thermometer.svg" alt="Bed icon" class="subcard__icon">
    </div>
    <div class="subcard__body">
      <div class="subcard__col">
        <span class="subcard__label">Min</span>
        <span class="subcard__value">${bedMinRenderer}</span>
      </div>
      <div class="subcard__col">
        <span class="subcard__label">Max</span>
        <span class="subcard__value">${bedMaxRenderer}</span>
      </div>
    </div>
  </div>

  <!-- Subcard Fan -->
  <div class="subcard">
    <div class="subcard__header">
      <h4 class="subcard__title">Fan Speeds</h4>
      <img src="../assets/svg/fan.svg" alt="Fan icon" class="subcard__icon">
    </div>
    <div class="subcard__body">
      <div class="subcard__col">
        <span class="subcard__label">Min</span>
        <span class="subcard__value">${fanMinRenderer}</span>
      </div>
      <div class="subcard__col">
        <span class="subcard__label">Max</span>
        <span class="subcard__value">${fanMaxRenderer}</span>
      </div>
    </div>
  </div>

  <!-- Subcard Drying -->
  <div class="subcard">
    <div class="subcard__header">
      <h4 class="subcard__title">Drying</h4>
      <img src="../assets/svg/droplets.svg" alt="Drying icon" class="subcard__icon">
    </div>
    <div class="subcard__body">
      <div class="subcard__col">
        <span class="subcard__label">Temp</span>
        <span class="subcard__value">${drytempRenderer}</span>
      </div>
      <div class="subcard__col">
        <span class="subcard__label">Time</span>
        <span class="subcard__value">${drytimeRenderer}</span>
      </div>
    </div>
  </div>

  <!-- Bloc “Détails complémentaires” -->
<div class="filament-card__details">
  <!-- 1. SKU & Barcode -->
  <div class="detail-card">
    <div class="detail-card__col">
      <span class="detail-card__label">SKU:</span>
      <span class="detail-card__value">${skuRenderer}</span>
    </div>
    <div class="detail-card__col">
      <span class="detail-card__label">Barcode:</span>
      <span class="detail-card__value">${barcodeRenderer}</span>
    </div>
  </div>


  <!-- 3. Color Type & Color List -->
  <div class="detail-card">
    <div class="detail-card__col">
      <span class="detail-card__label">Color Type:</span>
      <span class="detail-card__value">${colorTypeRenderer}</span>
    </div>
    <div class="detail-card__col">
      <span class="detail-card__label">Color List:</span>
      <span class="detail-card__value">${colorListRenderer}</span>
    </div>
  </div>

  <!-- 4. Documents (plein largeur) -->
  <div class="detail-card detail-card--docs">
    <span class="detail-card__label">Documents:</span>
    <ul class="document-list">
      ${dataLinkTDS}
      ${dataLinkMSDS}
      ${dataLinkRoHS}
      ${dataLinkREACH}
      ${dataLinkTips}
      ${dataLinkYouTube}
    </ul>
  </div>

  <!-- 5. Timestamp & UID -->
  <div class="detail-card">
    <div class="detail-card__col">
      <span class="detail-card__label">Timestamp:</span>
      <span class="detail-card__value">${timestamp}</span>
    </div>
    <div class="detail-card__col">
      <span class="detail-card__label">UID:</span>
      <span class="detail-card__value">${uidNumeric}</span>
    </div>
  </div>
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