$(document).ready(function () {
  combobox = new Combobox();
  // set tabindex="-1" cho các nút dropdown
  $('.f-custom-combobox .combobox-dropdown-btn').attr('tabindex', '-1');
  // Lưu các các combobox-data vào combobox để tiện cho việc lọc từ
  // Lấy tất cả các combobox
  let comboboxes = $('.f-custom-combobox');
  // Với mỗi combobox tìm html của thẻ con '.f-combobox-data' rồi lưu vào data('itemDataElements') của combobox ấy
  for (const combobox of comboboxes) {
    let itemDataElements = $(combobox).find('.f-combobox-data').html();
    $(combobox).data('itemDataElements', itemDataElements);
  }
});

class Combobox {

  selectedItem = null;

  constructor() {
    this.initEvents();
  }

  initEvents() {
    // Nhấn nút dropdown hiển thị data
    $('.f-combobox-btn.combobox-dropdown-btn').click(this.dropdownComboboxOnClick);
    // Chọn 1 item trong combobox-data
    $('.f-custom-combobox').on('click', '.f-combobox-data .f-combobox-item', this.itemComboboxOnClick.bind(this));
    // Bắt các key <arrow-down>, <arrow-up>, <enter>
    $('.f-custom-combobox input').keydown(this.inputComboboxKeyDown.bind(this));
    // Lọc item khi nhập các kí tự chữ cái vào combobox input
    $('.f-custom-combobox input').keyup(this.inputComboboxKeyUp.bind(this));
  }

  /**
   * Xử lý sự kiện ấn nút dropdown: đổi màu nút, hiện combobox-data
   * Author: Trang Hải Long (20/11/2021)
   */
  dropdownComboboxOnClick() {
    // highlight combobox
    $(this).siblings('input.f-combobox-input').focus()
    // Chuyển mũi tên lên thành mũi tên xuống
    $(this).toggleClass('combo-actions');
    // Toggle các lựa chọn khi ấn mũi tên xuống
    $(this).siblings('.f-combobox-data').toggle();
  }

  /**
   * Sự kiện chọn vào 1 item
   * Author: Trang Hải Long (20/11/2021)
   */
  itemComboboxOnClick(event) {
    let item = event.currentTarget;
    this.selectedItem = item;
    this.select();
  }

  /**
   * Hover bằng phím mũi tên và Chọn bằng phím <enter>
   * Author: Trang Hải Long (20/11/2021)
   */
  inputComboboxKeyDown(event) {
    let dropdownBtn = $(event.currentTarget).siblings('.combobox-dropdown-btn');
    let comboboxData = dropdownBtn.siblings('.f-combobox-data');
    let comboboxItems = comboboxData.children();

    // Chọn item đã được hover (nếu có)
    let hoveredItem = comboboxItems.filter('.f-combobox-item-hover');
    switch (event.keyCode) {
      case 13: // enter
        if (hoveredItem.length == 1) // Khi có 1 item dược chọn
        {
          hoveredItem.removeClass('f-combobox-item-hover');
          this.selectedItem = hoveredItem;
          this.select();
        }
        break;
      case 40: // arrow-down
        if (hoveredItem.length == 0) // Chưa có item nào được chọn
        {
          // Hiển thị comboboxData
          comboboxData.show();
          // Tạo hiệu ứng xổ xuống cho nút dropdown
          dropdownBtn.addClass('combo-actions');
          // Mặc định trỏ vào phần tử đầu tiên của mảng
          $(comboboxItems[0]).addClass('f-combobox-item-hover');
        } else // Nếu đã có item được hover trước đó thì chọn item bên dưới
        {
          // Xóa hover phần tử hiện tại
          hoveredItem.removeClass('f-combobox-item-hover');
          // Gán lại hoveredItem là phần tử tiếp theo (item nằm dưới nó)
          hoveredItem = hoveredItem.next();
          // Gán class cho hoveredItem
          hoveredItem.addClass('f-combobox-item-hover');
        }
        break;
      case 38: // arrow-up
        if (hoveredItem.length == 0) // Chưa có item nào được chọn
        {
          // Hiển thị comboboxData
          comboboxData.show();
          // Tạo hiệu ứng xổ xuống cho nút dropdown
          dropdownBtn.addClass('combo-actions');
          // Mặc định trỏ vào phần tử cuối cùng của mảng
          $(comboboxItems[comboboxItems.length - 1]).addClass('f-combobox-item-hover');
        } else // Nếu đã có item được hover trước đó thì chọn item bên trên
        {
          // Xóa hover phần tử hiện tại
          hoveredItem.removeClass('f-combobox-item-hover');
          // Gán lại hoveredItem là phần tử tiếp theo (item nằm trên nó)
          hoveredItem = hoveredItem.prev();
          // Gán class cho hoveredItem
          hoveredItem.addClass('f-combobox-item-hover')
        }
        break;
      default:
        break;
    }
  }

  /**
   * Lọc dữ liệu ô input
   * Author: Trang Hải Long (20/11/2021)
   */
  inputComboboxKeyUp(event) {
    // 0. Loại bỏ một số nút đặc biệt (arrow-up, arrow-down, enter...)
    switch (event.keyCode) {
      case 38: // arrow-up
      case 40: // arrow-down
      case 13: // enter
      case 9: // tab
      case 16: // shift
      case 17: // ctrl
      case 18: // alt
        break;
      default:
        // 1. Lấy input
        let comboboxInput = event.currentTarget;
        let inputValue = comboboxInput.value;
        let itemDataElements = $(comboboxInput).parent().data('itemDataElements');

        // 2. Build html
        $(comboboxInput).siblings('.f-combobox-data').html(itemDataElements);

        // 3. Lấy tất cả item của combobox
        let items = $(comboboxInput).siblings('.f-combobox-data').children();
        // 4. Duyệt từng item nếu không có phần tử trùng với inputValue thì loại bỏ
        for (const item of items) {
          let text = item.textContent;
          // Nếu text bên trong không phù hợp với nội dung người dùng gõ thì loại bỏ khỏi combobox-data
          if (!text.toLowerCase().includes(inputValue.toLowerCase())) {
            $(item).removeClass('combobox-item-active');
            item.remove();
          }
        }
        if (this.selectedItem) {
          $(this.selectedItem).addClass('combobox-item-active')
        }
        // 5. Hiển thị khung đã lọc
        $(comboboxInput).siblings('.f-combobox-data').show();
        // Tạo hiệu ứng xổ xuống cho nút dropdown
        let dropdownBtn = $(comboboxInput).siblings('.combobox-dropdown-btn');
        dropdownBtn.addClass('combo-actions');
        break;
    }

  }

  /**
   * Chọn 1 item: highlight item được chọn, gán data cho combobox, hiển thị rồi tắt hiển thị của combobox-data
   * @param item: item trong combobox-data được chọn
   * Author: Trang Hải Long (20/11/2021)
   */
  select() {
    let item = this.selectedItem;
    // Xóa chọn các dòng khác
    $(item).siblings().removeClass('combobox-item-active');
    // Chọn dòng mới
    $(item).addClass('combobox-item-active');
    let inputElement = $(item).parent().siblings('input');
    let text = $(item)[0].innerText;
    // Hiển thị text value lên input
    inputElement.val(text);
    // Lấy value của item
    let value = $(item).attr('value');
    let combobox = $(item).parents('.f-custom-combobox');
    // Gán val cho combobox
    $(combobox).data('value', value);

    let dropdownBtn = $(item).parent().siblings('.combobox-dropdown-btn');
    // Xóa class active cho dropdown button
    dropdownBtn.removeClass('combo-actions');
    // Tắt combobox-data
    $(item).parent().hide();
  }

}