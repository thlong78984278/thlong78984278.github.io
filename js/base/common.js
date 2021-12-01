class CommonJS {
  /**
   * Định dạng hiển thị thông tin ngày là (ngày/tháng/năm)
   * @param {Date} date 
   * Author: Trang Hải Long (21/11/2021)
   */
  static formatDateDDMMYYYY(date) {
    if (date) {
      // debugger
      const thisDate = new Date(date);
      // Định dạng ngày
      let day = thisDate.getDate();
      day = (day < 10 ? `0${day}` : day);
      // Định dạng tháng
      let month = thisDate.getMonth() + 1;
      month = (month < 10 ? `0${month}` : month);
      // Định dạng năm
      let year = thisDate.getFullYear();
      // Kết quả hiển thị theo định dạng ngày/tháng/năm
      return `${day}/${month}/${year}`;
    } else
      return '';
  }

  /**
   * Format dữ liệu để bind vào input date
   * @param {Date} date 
   * @returns {YYY}-{MM}-{DD}
   * Author: Trang Hải Long (23/11/2021)
   */
  static formatDateYYYYMMDD(date) {
    if (date) {
      // debugger
      const thisDate = new Date(date);
      // Định dạng ngày
      let day = thisDate.getDate();
      day = (day < 10 ? `0${day}` : day);
      // Định dạng tháng
      let month = thisDate.getMonth() + 1;
      month = (month < 10 ? `0${month}` : month);
      // Định dạng năm
      let year = thisDate.getFullYear();
      // Kết quả hiển thị theo định dạng ngày/tháng/năm
      return `${year}-${month}-${day}`;
    } else
      return '';
  }

  /**
   * Định dạng hiển thị tiền tệ theo VNĐ
   * @param {string} money 
   * Author: Trang Hải Long (23/11/2021)
   */
  static formatMoneyVND(money) {
    if (money) {
      return new Intl.NumberFormat('vi-VN', {
        style: `currency`,
        currency: 'VND'
      }).format(money);
    } else
      return '';
  }

  /**
   * Xóa highlight của người dùng trên trang web
   * Author: Trang Hải Long (23/11/2021)
   */
  static clearSelection() {
    if (document.selection && document.selection.empty) {
      document.selection.empty();
    } else if (window.getSelection) {
      var sel = window.getSelection();
      sel.removeAllRanges();
    }
  }

  /**
   * Hiển thị toast message
   * @param {object} toastMsg 
   * Author: Trang Hải Long (23/11/2021)
   */
  static toastMsgPopup(toastMsg) {
    if(toastMsg)
    {
      $(toastMsg).fadeIn(3000);
      setTimeout(() => {
        $(toastMsg).fadeOut(3000);
      }, 3000);
    }
  }
}