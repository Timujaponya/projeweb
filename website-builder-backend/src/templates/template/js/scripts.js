document.addEventListener('DOMContentLoaded', function() {
    // Sayfa yüklendiğinde çalışacak kodlar
    console.log('Sayfa hazır!');
    
    // Bildirim sistemi oluştur
    const createNotification = (message, type = 'info') => {
      // Bildirim container'ı kontrol et, yoksa oluştur
      let notificationContainer = document.getElementById('notification-container');
      if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000;';
        document.body.appendChild(notificationContainer);
      }
      
      // Bildirim elementi oluştur
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.style.cssText = `
        background-color: ${type === 'error' ? '#f8d7da' : '#d4edda'}; 
        color: ${type === 'error' ? '#721c24' : '#155724'}; 
        padding: 12px 20px; 
        margin-bottom: 10px; 
        border-radius: 4px; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        transition: all 0.3s ease;
      `;
      
      notification.textContent = message;
      
      // Bildirim kapat butonu ekle
      const closeBtn = document.createElement('span');
      closeBtn.style.cssText = 'margin-left: 10px; cursor: pointer; font-weight: bold;';
      closeBtn.textContent = '×';
      closeBtn.onclick = () => {
        notification.remove();
      };
      notification.appendChild(closeBtn);
      
      // Bildirim göster
      notificationContainer.appendChild(notification);
      
      // 5 saniye sonra otomatik kapat
      setTimeout(() => {
        notification.remove();
      }, 5000);
    };
    
    // Tüm butonlara tıklama olayı ekle
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        createNotification('Butona tıklandı!', 'info');
      });
    });
  });