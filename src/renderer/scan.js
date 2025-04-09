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
        resultDiv.innerHTML = renderOnlineData(apiData, uidNumeric);

      } catch (apiError) {
        console.warn("Échec de l'API, fallback offline :", apiError);
        resultDiv.innerHTML = renderOfflineData(tagData);
      }
    } else {
      // Mode TigerTag Maker (offline)
      resultDiv.innerHTML = renderOfflineData(tagData);
    }

  } catch (err) {
    console.error("Erreur de scan :", err);
    resultDiv.innerHTML = `<p>Erreur lors du scan : ${err.message}</p>`;
  }
});

// === AFFICHAGE OFFLINE (TigerTag Maker) ===
function renderOfflineData(tagData) {
  const rgbHex = ((tagData.color >>> 8) & 0xFFFFFF).toString(16).padStart(6, '0');
  const colorHex = '#' + rgbHex;
  const r = (tagData.color >> 24) & 0xFF;
  const g = (tagData.color >> 16) & 0xFF;
  const b = (tagData.color >> 8) & 0xFF;
  const a = (tagData.color & 0xFF);

  return `
    <h3>TigerTag Maker (Offline)</h3>
    <p><strong>Tag ID:</strong> ${tagData.uidNumeric}</p>
    <p>Version: ${tagData.versionLabel || 'N/A'} (ID : ${tagData.tigerTagID})</p>
    <p>ProductID: ${tagData.productIdDecimal ?? 'N/A'} (${tagData.productID.join(' ')})</p>
    <p>Material: ${tagData.materialLabel || 'N/A'} (ID : ${tagData.materialID})</p>
    <p>Aspect 1: ${tagData.aspect1Label || 'N/A'} (ID : ${tagData.aspect1ID})</p>
    <p>Aspect 2: ${tagData.aspect2Label || 'N/A'} (ID : ${tagData.aspect2ID})</p>
    <p>Type: ${tagData.typeLabel || 'N/A'} (ID : ${tagData.typeID})</p>
    <p>Diameter: ${tagData.diameterLabel || 'N/A'} (ID : ${tagData.diameterID})</p>
    <p>Brand: ${tagData.brandLabel || 'N/A'} (ID : ${tagData.brandID})</p>
    <p>
      Color:
      <input type="color" value="${colorHex}" disabled style="width:40px;height:25px;border:none;vertical-align:middle;" />
      ${colorHex} : RGBA(${r},${g},${b},${a})
    </p>
    <p>Weight: ${tagData.weightValue !== undefined ? tagData.weightValue : 'N/A'}</p>
    <p>Unit: ${tagData.unitLabel || 'N/A'} (ID : ${tagData.unitId})</p>
    <p>Temp Min: ${tagData.tempMin} °C</p>
    <p>Temp Max: ${tagData.tempMax} °C</p>
    <p>Dry Temp: ${tagData.dryTemp} °C</p>
    <p>Dry Time: ${tagData.dryTime} h</p>
    <p>TimeStamp: ${tagData.timeStampReadable ?? 'Not set'}</p>
  `;
}

// === AFFICHAGE ONLINE (TigerTag Pro) ===
function renderOnlineData(apiData, uidNumeric) {
  // Extraire les composantes RGBA depuis la chaîne "#RRGGBBAA"
  const rawColor = apiData.filament.color.replace('#', '');
  const rgbaInt = parseInt(rawColor, 16);
  const r = (rgbaInt >> 24) & 0xFF;
  const g = (rgbaInt >> 16) & 0xFF;
  const b = (rgbaInt >> 8) & 0xFF;
  const a = rgbaInt & 0xFF;

  const rgbHex = rawColor.substring(0, 6);
  const colorHex = '#' + rgbHex;

  return `
    <h3>TigerTag Pro (Online)</h3>
    <p><strong>Tag ID:</strong> ${uidNumeric}</p>
    <p><strong>Title:</strong> ${apiData.title}</p>
    <p><strong>Brand:</strong> ${apiData.brand}</p>
    <p><strong>Series:</strong> ${apiData.series}</p>
    <p><strong>Material:</strong> ${apiData.filament.material}</p>
    <p>
      <strong>Color:</strong> ${apiData.name}
      <input type="color" value="${colorHex}" disabled style="width:40px;height:25px;border:none;vertical-align:middle;" />
      ${colorHex} : RGBA(${r},${g},${b},${a})
    </p>
    <p><strong>Diameter:</strong> ${apiData.filament.diameter} mm</p>
    <p><strong>Weight:</strong> ${apiData.filament.weight} g</p>
    <p><strong>Drying:</strong> ${apiData.dryer.temp} °C for ${apiData.dryer.time} hours</p>
    <p><strong>SKU:</strong> ${apiData.sku}</p>
    <p><strong>Barcode:</strong> ${apiData.barcode}</p>
    <p><strong>Bambu ID:</strong> ${apiData.metadata.bambuID}</p>
    <p><strong>Creality ID:</strong> ${apiData.metadata.crealityID}</p>
    <p><img src="${apiData.links.image}" alt="Product image" style="width:200px;" /></p>
  `;
}