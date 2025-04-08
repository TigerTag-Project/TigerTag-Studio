document.getElementById('scanActionBtn').addEventListener('click', async () => {
  try {
    const tagData = await window.electronAPI.readTag();
    const resultDiv = document.getElementById('scanResult');
    
    const rgbHex = ((tagData.color >>> 8) & 0xFFFFFF).toString(16).padStart(6, '0');
    const colorHex = '#' + rgbHex;
    const r = (tagData.color >> 24) & 0xFF;
    const g = (tagData.color >> 16) & 0xFF;
    const b = (tagData.color >> 8) & 0xFF;
    const a = (tagData.color & 0xFF);
    
    const resultHTML = `
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
    resultDiv.innerHTML = resultHTML;
  } catch (err) {
    console.error("Error scanning tag:", err);
    alert("Erreur lors du scan. Consultez la console pour plus d'informations.");
  }
});