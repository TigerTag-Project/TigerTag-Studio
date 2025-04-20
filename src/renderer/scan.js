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
  const materialRenderer = apiData.filament.material ? `${apiData.filament.material}` : '';
  const aspect1Renderer = apiData.filament.aspect1 ? `${apiData.filament.aspect1}` : '';
  const aspect2Renderer = apiData.filament.aspect2 ? `/ ${apiData.filament.aspect2}` : '';
  const shoreRenderer = apiData.filament.shore ? `Shore: ${apiData.filament.shore}` : '';
  const diameterRenderer = apiData.filament.diameter ? `${apiData.filament.diameter} mm` : '';
  const weightRenderer = apiData.filament.weight ? `${apiData.filament.weight} ${apiData.filament.weight_unit}` : '';
  const recycledRenderer = apiData.filament.recycled ? `Recycled : ✅`: ``;
  const refillRenderer = apiData.filament.refill ? `Refill : ✅` : ``;
  const filledRenderer = apiData.filament.filled ? `Filled : ✅` : ``;
  const colorTypeRenderer = apiData.filament.color_info?.type ? `Color Type: ${apiData.filament.color_info.type}` : '';
  const transdistRenderer = apiData.filament.transmission_dist ? `Transmission Dist: ${apiData.filament.transmission_dist}` : '<p class="result-line"><strong>Transmission Dist:</strong> --</p>';
  const colorListRenderer = apiData.filament.color_info?.colors ? `List:${apiData.filament.color_info.colors.join(', ')}` : '';
  const colorHslaRenderer = apiData.filament.color_info?.hsla ? `HSLA:${apiData.filament.color_info.hsla}` : '';
  const colorRalRenderer = apiData.filament.color_info?.ral ? `RAL:${apiData.filament.color_info.ral}` : '';
  const drytempRenderer = apiData.dryer.temp ? `${apiData.dryer.temp} °C` : '';
  const drytimeRenderer = apiData.dryer.time ? `${apiData.dryer.time} H` : '';
  const nozzleMinRenderer = apiData.nozzle.temp_min ? `${apiData.nozzle.temp_min} °C` : '';
  const nozzleMaxRenderer = apiData.nozzle.temp_max ? `${apiData.nozzle.temp_max} °C` : '';
  const bedMinRenderer = apiData.bed.temp_min ? `${apiData.bed.temp_min} °C` : '';
  const bedMaxRenderer = apiData.bed.temp_max ? `${apiData.bed.temp_max} °C` : '';
  const fanMinRenderer = apiData.fan.speed_min ? `${apiData.fan.speed_min} %` : '';
  const fanMaxRenderer = apiData.fan.speed_max ? `${apiData.fan.speed_max} %` : '';
  const skuRenderer = apiData.sku ? `${apiData.sku}` : '';
  const barcodeRenderer = apiData.barcode ? `${apiData.barcode}` : '';
  const bambuRenderer = apiData.metadata?.bambuLabel && apiData.metadata?.bambuID ? `BambuLab: ${apiData.metadata.bambuLabel}` : '';
  const crealityRenderer = apiData.metadata?.crealityLabel && apiData.metadata?.crealityID ? `Creality: ${apiData.metadata.crealityLabel}`: '';
  const dataLinkTDS = apiData.links.tds ? `<li><a href="${apiData.links.tds}" target="_blank">TDS</a></li>` : '';
  const dataLinkMSDS = apiData.links.msds ? `<li><a href="${apiData.links.msds}" target="_blank">MSDS</a></li>` : '';
  const dataLinkRoHS = apiData.links.rohs ? `<li><a href="${apiData.links.rohs}" target="_blank">RoHS</a></li>` : '';
  const dataLinkREACH = apiData.links.reach ? `<li><a href="${apiData.links.reach}" target="_blank">REACH</a></li>` : '';
  const dataLinkTips = apiData.links.tips ? `<li><a href="${apiData.links.tips}" target="_blank">Tips</a></li>` : '';
  const dataLinkYouTube = apiData.links.youtube ? `<li><a href="${apiData.links.youtube}" target="_blank">YouTube</a></li>` : '';

  
  return `
  <div class="filament-card">
    <div class="filament-card__header">
      <legend class="filament-card__title">${legendRenderer}</legend>
    </div>

    <h3 class="filament-card__name">${brandRenderer} - ${seriesRenderer} - ${nameRenderer}</h3>
    <div class="filament-card__body">
      <div class="filament-card__image">
      <img src="${mainImgRenderer}" alt="Product image" class="result-image" />
    </div>
      <div class="filament-card__info">
        <div class="filament-card__row">
          <div class="filament-card__field">
            <span class="label">Material:</span>
            <span class="value">${materialRenderer}</span>
          </div>
          <div class="filament-card__field">
            <span class="label">Aspect:</span>
            <span class="value">${aspect1Renderer} ${aspect2Renderer}</span>
          </div>
        </div>

        <div class="filament-card__row">
          <div class="filament-card__field">
            <span class="value">${shoreRenderer}</span>
          </div>
          <div class="filament-card__field">
            <span class="label">Diameter:</span>
            <span class="value">${diameterRenderer}</span>
          </div>
          <div class="filament-card__field">
            <span class="label">Weight:</span>
            <span class="value">${weightRenderer}</span>
          </div>
        </div>

        <div class="filament-card__flags">
          ${refillRenderer}
          ${recycledRenderer}
          ${filledRenderer}
        </div>

        <div class="filament-card__field">
          <div class="filament-card__color-swatch" style="background:${colorHex}"></div>
          <div class="value">Hex: ${colorHex}</div>
          <div class="value">RGBA: ${r}, ${g}, ${b}, ${a}</div>
        </div>

        <div class="filament-card__row">
          <div class="filament-card__field">
            <span class="label">Nozzle:</span>
            <span class="value">${nozzleMinRenderer} / ${nozzleMaxRenderer}</span>
          </div>
          <div class="filament-card__field">
            <span class="label">Bed:</span>
            <span class="value">${bedMinRenderer} / ${bedMaxRenderer}</span>
          </div>
          <div class="filament-card__field">
            <span class="label">Fan:</span>
            <span class="value">${fanMinRenderer} / ${fanMaxRenderer}</span>
          </div>
        </div>

        <div class="filament-card__row">
          <div class="filament-card__field">
            <span class="label">Drying:</span>
            <span class="value">${drytempRenderer} / ${drytimeRenderer}</span>
          </div>
        </div>

        <div class="filament-card__row">
          <div class="filament-card__field">
            <span class="label">SKU:</span>
            <span class="value">${skuRenderer}</span>
          </div>
          <div class="filament-card__field">
            <span class="label">Barcode:</span>
            <span class="value">${barcodeRenderer}</span>
          </div>
        </div>

        <div class="filament-card__row">
          <div class="filament-card__field">
            <span class="value">${bambuRenderer}</span>
          </div>
          <div class="filament-card__field">
            <span class="value">${crealityRenderer}</span>
          </div>
        </div>

        <div class="filament-card__row">
          <div class="filament-card__field">
            <span class="value">${colorTypeRenderer}</span>
          </div>
          <div class="filament-card__field">
            <span class="value">${colorListRenderer}</span>
          </div>
        </div>

        <div class="filament-card__row">
          ${dataLinkTDS}
          ${dataLinkMSDS}
          ${dataLinkRoHS}
          ${dataLinkREACH}
          ${dataLinkTips}
          ${dataLinkYouTube}
        </div>
        <div class="filament-card__field">
      <span class="value">TimeStamp: ${timestamp}</span>
      <span class="value">UID: ${uidNumeric}</span>
      </div>
      </div> <!-- .filament-card__info -->
    </div>   <!-- .filament-card__body -->
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