$(document).ready(function () {
  employeePage = new EmployeePage();
});

class EmployeePage {
  FormMode = null;
  apiUrl = 'http://amis.manhnv.net/api/v1';
  employeeApiUrl = `${this.apiUrl}/Employees`;
  departmentApiUrl = `${this.apiUrl}/Departments`;
  positionApiUrl = `${this.apiUrl}/Positions`;
  maxPageNumberDisplay = 5;
  pageNumber = 1;
  totalPage = 1;
  constructor() {
    // Gán các sự kiện
    this.initEvents();
    // Load dữ liệu mặc định cho combobox Paging
    $('#cbxPaging').data('value', 10);
    $('#cbxPaging .f-combobox-input').val('10 bản ghi trên 1 trang');
    // load dữ liệu bảng
    this.loadData();
    this.loadDepartmentComboboxData();
  }

  initEvents() {
    // Làm mới dữ liệu
    $('#btnRefresh').click(this.loadData.bind(this));
    // Tắt dialog Thêm/Sửa thông tin nhân viên
    $('#btnClosePopup').click(this.closePopup);
    $('#btnCancelPopup').click(this.closePopup);

    // Các chức năng Thêm / Sửa / Xóa cơ bản --------------------------------------------------------------------------------------------
    // Hiển thị form thêm mới nhân viên
    $('#btnAddEmployee').click(this.addEmployee.bind(this));
    // Hiển thị form update nhân viên
    $('#tblEmployee').on('click', '.f-utility-dropdown .f-dropdown-text', this.updateEmployee.bind(this));
    // Hiển thị contextMenu khi nhấn dropdown
    $('#tblEmployee').on('click', '.f-utility-dropdown .dropdown-btn', this.showContextMenu);
    // Xóa dòng dữ liệu đồng thời hiển thị form thông báo "Bạn có chắc xóa?"
    // Ấn nút xóa hiển thị tin nhắn
    $('#delete').click(this.showDeleteMessagePopup.bind(this));
    // Ấn nút có trong tin nhắn -> xóa và tắt tin nhắn
    $('#dlgDeletePopup .f-btn').click(this.delete.bind(this));
    // Ấn nút không trong tin nhắn -> không xóa và tắt tin nhắn
    $('#dlgDeletePopup .f-second-btn').click(this.closeDeleteMessagePopup.bind(this));
    // Lưu thông tin đồng thời kiểm tra mã nhân viên có hợp lệ không, nếu không thì hiện thông báo.
    $('#btnSaveData').click(this.saveData.bind(this));
    $('#dlgSaveErrorPopup .f-btn').click(this.closeSaveErrorPopup.bind(this));

    // Chức năng validate dữ liệu -------------------------------------------------------------------------------------------
    // Validate Tên
    $('#txtEmployeeName').keyup(this.validateEmployeeName);
    // Validate Đơn vị
    $('#cbxDepartment').on('click', '.f-combobox-item', this.validateDepartmentName);
    $('#cbxDepartment .f-combobox-input').keyup(this.validateDepartmentNameOnKeyUp.bind(this));

    // Chức năng phân trang -------------------------------------------------------------------------------------------
    // Bấm nút chuyển trang
    $('.page-navigator').on('click', '.page-number', this.pageNumberOnClick.bind(this));
    // Bấm nút chuyển trang trước đó
    $('#previousPage').on('click', this.previousPageOnClick.bind(this));
    // Bấm nút chuyển trang tiếp theo
    $('#nextPage').on('click', this.nextPageOnClick.bind(this));
    // LoadData khi ấn chọn một lựa chọn trong combobox Paging
    $('#cbxPaging').on('click', '.f-combobox-item', this.loadData.bind(this));
    $('#cbxPaging').keyup(this.cbxPagingEnter.bind(this));
    // Phân trang khi ấn search button
    $('#searchBtn').click(this.loadData.bind(this));
    // Phân trang khi ấn enter vào input searchText
    $('#searchText').keydown(this.searchTextOnEnter.bind(this));

    // Focus vào ô nhập liệu đầu tiên
    $('#txtBankBranchName').keydown(this.toTheBeginning.bind(this));
  }


  /**
   * Tab trở lại ô nhập liệu đầu tiên trong dialog Thêm/Sửa thông tin nhân viên
   */
  toTheBeginning(event) {
    if (event.keyCode == 9) {
      $('#nothing').focus();
    }
  }

  /* #region Validate thông tin nhập */

  validateEmployeeName(event) {
    switch (event.keyCode) {
      case 38: // arrow-up
      case 13: // enter
      case 40: // arrow-down
      case 9: // tab
      case 16: // shift
      case 17: // ctrl
      case 18: // alt
        break;

      default: // Các kí tự thông thường
        if (event.currentTarget) {
          if (event.currentTarget.value == '') {
            $(this).addClass('error');
            $(this).attr('title', 'Tên không được để trống.');
          } else {
            $(this).removeClass('error');
            $(this).attr('title', null);
          }
        }
        break;
    }
  }

  validateDepartmentName(event) {
    let me = $('#cbxDepartment .f-combobox-input');
    if (me) {
      for (const department of $('#cbxDepartment').data('itemDataElements')) {
        let departmentName = department.innerText.trim();
        if (me.val() == departmentName) {
          $(me).removeClass('error');
          $(me).attr('title', null);
          return;
        }
      }
      let msg = me.val() == '' ? 'Đơn vị không được để trống' : 'Dữ liệu không có trong danh sách';

      $(me).addClass('error');
      $(me).attr('title', msg);
      return
    }
  }

  validateDepartmentNameOnKeyUp(event) {
    switch (event.keyCode) {
      case 38: // arrow-up
      case 40: // arrow-down
      case 9: // tab
      case 16: // shift
      case 17: // ctrl
      case 18: // alt
        return
      default: // Các kí tự thông thường
        this.validateDepartmentName();
    }
  }

  /* #endregion */

  /* #region Phân trang */

  /**
   * load dữ liệu khi nhấn enter trong input textSearch
   */
  searchTextOnEnter(event) {
    if (event.keyCode == 13) {
      this.loadData.bind(this)();
    }
  }

  /**
   * load dữ liệu khi đổi số dòng / trang ở combobox
   */
  cbxPagingEnter(event) {
    // debugger
    switch (event.keyCode) {
      case 13:
        this.loadData();
        break;
      case 38:
      case 40:
        break
      default:
        let itemDataElements = $(event.currentTarget).data('itemDataElements');
        $(event.currentTarget).children('.f-combobox-data').html(itemDataElements);
        break;
    }
  }

  /**
   * Chuyển trang trước (nếu có) khi nhấn nút Trước
   */
  previousPageOnClick() {
    // gen ra số trang
    this.pageNumber -= 1;
    this.loadData();
  }

  /**
   * Chuyển trang sau (nếu có) khi nhấn nút Sau
   */
  nextPageOnClick() {
    this.pageNumber += 1;
    this.loadData();
  }

  /**
   * Chuyển đến trang n khi nhấn vào số trang n
   */
  pageNumberOnClick(event) {
    // Xóa hết class active của các nút
    $('.page-number').removeClass('active');
    // Thêm class active vào nút đang bấm
    event.currentTarget.classList.add('active');
    this.pageNumber = event.currentTarget.textContent;
    // Reload
    this.loadData();
  }


  /* #region Nạp dữ liệu */

  /**
   * Lấy dữ liệu từ database xây dựng các dòng hiển thị trên bảng
   * Author: Trang Hải Long (02/12/2021)
   */
  loadData() {
    // Làm sạch bảng
    $("#tblEmployee tbody").empty();
    let checkboxes = $("input[type='checkbox']");
    for (const checkbox of checkboxes) {
      checkbox.checked = false;
    }

    // Hiển thị màn hình chờ
    $('.f-loading').show();

    // Lấy thông tin phân trang
    // Từ khóa tìm kiếm
    let searchText = String($('#searchText').val());
    // Số dòng / 1 trang, mặc định 1 trang 10 dòng
    let pageSize = 10;
    if ($('#cbxPaging').data('value')) {
      pageSize = $('#cbxPaging').data('value');
    }
    // Lấy trang, mặc định ở trang 1
    let pageNumber = this.pageNumber;
    // Nếu đã lấy dữ liệu phân trang => có totalPage thì xử lý gán pageNumber cho trường hợp gọi api phân trang các lần sau (có thể thông qua bấm số trang hoặc nút chuyển trang "Trước", "Sau")
    if (pageNumber > this.totalPage) {
      pageNumber = this.totalPage;
    }
    if (pageNumber < 1) {
      pageNumber = 1;
    }
    this.pageNumber = pageNumber;

    // Lấy link api
    let filterApi = `${this.employeeApiUrl}/filter?pageSize=${pageSize}&pageNumber=${pageNumber}`;
    if (searchText.length >= 1) {
      filterApi = filterApi + `&employeeFilter=${searchText}`;
    }

    // Lấy dữ liệu
    let data = [];
    //  Gọi lên Api thực hiện lấy dữ liệu -> Sử dụng ajax
    $.ajax({
      type: "GET",
      url: filterApi,
      async: false,
      success: function (response) {
        data = response;
      },
      error: function (res) {
        alert("có lỗi xảy ra");
      }
    });

    // Nếu có dữ liệu trả về
    if (data != undefined) {
      let employees = data.Data;
      let totalRecord = data.TotalRecord;
      $('#totalRecord').text(totalRecord);
      // Tổng số trang lấy được
      let totalPage = data.TotalPage;
      this.totalPage = totalPage;
      // Số thứ tự trang hiện tại: pageNumber

      // gen ra số trang
      // xóa tất cả pageNumber
      $('.page-number-list').empty();
      // a = (trang hiện tại) % 5
      let a = pageNumber % 5;
      // b = (trang hiện tại - 1) / 5
      let b = Math.floor((pageNumber - 1) / 5);
      // Nếu b*5 + 5 > tổng số trang
      if (b * 5 + 5 > totalPage) {
        // Số trang chạy từ b*5 + 1 -> tổng số trang
        for (let i = b * 5 + 1; i <= totalPage; i++) {
          if (i == pageNumber) {
            $('.page-number-list').append(`<div class="page-number active">${i}</div>`)
          } else {
            $('.page-number-list').append(`<div class="page-number">${i}</div>`)
          }
        }
      } else { // Nếu b*5 + 5 <= tổng số trang
        // Số trang chạy từ b*5 + 1 -> b*5 + 5
        for (let i = 1; i <= 5; i++) {
          if (b * 5 + i == pageNumber) {
            $('.page-number-list').append(`<div class="page-number active">${b*5 +i}</div>`);
          } else {
            $('.page-number-list').append(`<div class="page-number">${b*5 +i}</div>`);
          }
        }
      }

      // Build Table
      $.each(employees, function (indexInArray, employee) {
        let employeeCode = employee.EmployeeCode;
        let employeeName = employee.EmployeeName;
        let genderName = employee.GenderName;
        let dateOfBirth = CommonJS.formatDateDDMMYYYY(employee.DateOfBirth);
        let identityNumber = employee.IdentityNumber;
        let positionName = employee.PositionName;
        let departmentName = employee.DepartmentName;
        let bankAccountNumber = employee.BankAccountNumber;
        let bankName = employee.BankName;
        let bankBranchName = employee.BankBranchName;

        let employeeId = employee.EmployeeId;

        let tr = `<tr>
                  <td class="text-align-left"><input type="checkbox"></td>
                  <td class="text-align-left">${employeeCode?employeeCode:''}</td>
                  <td class="text-align-left">${employeeName?employeeName:''}</td>
                  <td class="text-align-left">${genderName?genderName:''}</td>
                  <td class="text-align-center">${dateOfBirth?dateOfBirth:''}</td>
                  <td class="text-align-left">${identityNumber?identityNumber:''}</td>
                  <td class="text-align-left">${positionName?positionName:''}</td>
                  <td class="text-align-left">${departmentName?departmentName:''}</td>
                  <td class="text-align-left">${bankAccountNumber?bankAccountNumber:''}</td>
                  <td class="text-align-left">${bankName?bankName:''}</td>
                  <td class="text-align-left">${bankBranchName?bankBranchName:''}</td>
                  <td class="text-align-center">
                    <div class="f-utility-dropdown">
                      <div class="f-dropdown-text text-align-center">Sửa</div>
                      <button class="dropdown-btn">
                        <div class="f-icon icon-16 f-icon-arrow-up--blue"></div>
                      </button>
                    </div>
                  </td>
                </tr>
                `;
        $("#tblEmployee tbody").prepend(tr);

        // Thêm data employeeId cho từng dòng dữ liệu nhân viên
        $(`tbody tr:nth-child(1)`).data('value', employeeId);
        // Thêm data employeeCode cho từng dòng dữ liệu nhân viên
        $(`tbody tr:nth-child(1)`).data('employeeCode', employeeCode);
      });
    }

    // Ẩn màn hình chờ sau khi đã kết thúc nạp dữ liệu
    $('.f-loading').hide();

  }

  /**
   * Lấy mã định danh và tên của phòng ban, load vào combobox cbxDeparment
   * Author: Trang Hải Long (21/11/2021)
   */
  loadDepartmentComboboxData() {
    $.ajax({
      type: "GET",
      url: this.departmentApiUrl,
      success: function (response) {
        for (const department of response) {
          let optionHTML = `
                <div class="f-combobox-item" value="${department.DepartmentId}">
                  <div class="combobox-item-text">${department.DepartmentName}</div>
                </div>
        `
          // Binding item combobox Department
          $('#cbxDepartment .f-combobox-data').append(optionHTML);
        }
        // Gán dữ liệu combobox Department để tìm kiếm bằng việc gõ các kí tự
        let itemDataElements = $('#cbxDepartment').find('.f-combobox-data').children();
        $('#cbxDepartment').data('itemDataElements', itemDataElements);
      }
    });
  }

  /* #endregion */

  /* #endregion */

  /**
   * Tắt dialog Thêm/Sửa dữ liệu
   * Author: Trang Hải Long (23/11/2021)
   */
  closePopup() {
    // Ẩn màn hình Popup
    $('#dlgPopup').hide();
    // Reset dữ liệu employeeId khi tắt popup
    $('#btnSaveData').data('employeeId', null);
    // Xóa class error cho các input
    $('input').removeClass('error');
    // Reset hiển thị của combobox dropdown btn
    $('.f-combobox-btn.combobox-dropdown-btn').removeClass('combo-actions');
    $('.f-combobox-data').hide();
    // Reset hiển thị radio button
    for (const btn of $('#dlgPopup input[type="radio"]')) {
      btn.checked = false;
    }
  }

  /**
   * Thêm mới nhân viên
   * Author: Trang Hải Long (23/11/2021)
   */
  addEmployee() {
    // FormMode: Add
    this.FormMode = Enum.FormMode.Add;
    // Hiển thị Form thông tin nhân viên
    $('#dlgPopup').show();
    // Xóa dữ liệu đã nhập trước đó
    $('#dlgPopup input[type!="radio"]').val(null)
    // Uncheck radio
    for (const btn of $('#dlgPopup input[type="radio"]')) {
      btn.checked = false;
    }
    // Uncheck checkbox
    for (const btn of $('#dlgPopup input[type="checkbox"]')) {
      btn.checked = false;
    }

    $('.f-custom-combobox .f-combobox-item').removeClass('combo-actions');
    // Lấy mã nhân viên mới và hiển thị lên ô nhập liệu
    $.ajax({
      type: "GET",
      url: `${this.employeeApiUrl}/NewEmployeeCode`,
      success: function (response) {
        $('#txtEmployeeCode').val(response);
        // Focus vào ô nhập liệu đầu tiên
        $('#txtEmployeeCode').focus();
      }
    });
  }

  /**
   * Thay đổi thông tin nhân viên
   * Author: Trang Hải Long (23/11/2021)
   */
  updateEmployee(event) {
    let me = this
    // FormMode: Edit
    this.FormMode = Enum.FormMode.Edit;
    CommonJS.clearSelection();
    // Hiển thị Form thông tin nhân viên
    $('#dlgPopup').show();
    let employeeId = $(event.currentTarget.parentElement.parentElement.parentElement).data('value');
    // Xóa dữ liệu đã nhập trước đó
    $('input[type!="radio"]').val(null)

    // Lấy dữ liệu nhân viên theo mã nhân viên
    $.ajax({
      type: "GET",
      url: `${this.employeeApiUrl}/${employeeId}`,
      success: function (employee) {
        // Bind dữ liệu input
        let inputs = $('#dlgPopup input[fieldName]');
        for (const input of inputs) {
          // Lấy ra fieldName của input hiện tại và thông tin của nhân viên tương ứng với fieldName đó
          let fieldName = $(input).attr('fieldName');
          let value = employee[fieldName];
          if (value) {
            // Trường hợp đặc biệt input form là date phải định dạng lại value
            if (input.type == 'date') {
              value = CommonJS.formatDateYYYYMMDD(value);
            }
            // Gán value cho input
            $(input).val(value);
          } else
            $(input).val(null);
        }

        // Bind dữ liệu combobox
        let departmentId = employee.DepartmentId;
        $('#cbxDepartment').data('value', departmentId);
        let departmentName = '';
        $.ajax({
          type: "GET",
          async: false,
          url: me.departmentApiUrl + `/${departmentId}`,
          success: function (response) {
            departmentName = response.DepartmentName;
          },
          error: function (res) {
            console.log(res);
          }
        });
        $('#cbxDepartment input').val(departmentName);

        // Bind dữ liệu giới tính
        let gender = employee['Gender'];
        for (const btn of $('#dlgPopup input[type="radio"]')) {
          if (btn.value == gender) {
            btn.checked = true;
          }
        }
      }
    });

    // Gán dữ liệu id của nhân viên vào nút save để tiện thực hiện lưu thông tin nhân viên lên database
    $('#btnSaveData').data('employeeId', employeeId);
  }

  /* #region Cất dữ liệu */

  /**
   * Cất dữ liệu người dùng nhập lên kho
   * Author: Trang Hải Long (23/11/2021)
   */
  saveData(event) {
    let me = this;
    let employeeId = $('#btnSaveData').data('employeeId');
    // Tạo employee object lưu dữ liệu Form
    let employee = {};

    // Lấy dữ liệu từ input Form:
    let inputs = $('#dlgPopup input[fieldName]');
    for (const input of inputs) {
      // Lấy ra fieldName của input hiện tại và thông tin của nhân viên tương ứng với fieldName đó
      let fieldName = $(input).attr('fieldName');
      let value = input.value;
      if (value) {
        employee[fieldName] = value;
      } else
        employee[fieldName] = null;
    }

    // Lấy dữ liệu từ radio
    for (const btn of $('#dlgPopup input[type="radio"]')) {
      if (btn.checked) {
        employee['Gender'] = btn.value;
      }
    }
    // employee['Gender'] = $('input[name="Gender"]:checked').val();

    // Lấy dữ liệu từ combobox Form:
    employee['DepartmentId'] = $('#cbxDepartment').data('value');
    let employeeCode = employee['EmployeeCode'];
    // Gọi api cất dữ liệu
    if (this.FormMode == Enum.FormMode.Add) {
      $.ajax({
        type: "POST",
        url: this.employeeApiUrl,
        data: JSON.stringify(employee),
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
          me.loadData();
        },
        error: function (res) {
          console.log(res);
          // Hiển thị thông báo trùng lặp employeeCode
          if (res.status == 400) {
            if (res.responseJSON.devMsg == 'Mã khách hàng đã tồn tại trong hệ thống.') { // Mã khách hàng?
              $('#duplicatedEmployeeCode').text(employeeCode);
              $('#dlgSaveErrorPopup').show();
            }
          }
        }
      });
    } else {
      $.ajax({
        type: "PUT",
        url: `${this.employeeApiUrl}/${employeeId}`,
        data: JSON.stringify(employee),
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
          // load lại dữ liệu
          me.loadData();
        },
        error: function (res) {
          console.log(res);
        }
      });
    }
    me.closePopup();
  }

  /**
   * Tắt tin nhắn mã nhân viên trùng
   */
  closeSaveErrorPopup() {
    // Tắt hiển thị dlgSaveErrorPopup
    $('#dlgSaveErrorPopup').hide();
    // Xóa dữ liệu hiển thị mã nhân viên bị trùng
    $('#duplicatedEmployeeCode').text('');
  }

  /* #endregion */

  /**
   * Hiển thị contextMenu để thực hiện các chức năng Nhân bản / Xóa / Ngưng sử dụng
   */
  showContextMenu() {
    let contextMenu = $('#contextMenu');
    contextMenu.toggle();
    let top_pos = $(this).offset().top;
    let left_pos = $(this).offset().left;
    if (top_pos + 24 <= window.innerHeight - 90) {
      contextMenu.css('top', `calc(${top_pos}px + 24px)`);
    } else {
      contextMenu.css('top', `calc(${top_pos}px - 88px)`);
    }
    contextMenu.css('left', `calc(${left_pos}px - 86px)`);

    let employeeId = $(this.parentElement.parentElement.parentElement).data('value');
    let employeeCode = $(this.parentElement.parentElement.parentElement).data('employeeCode');
    $('#contextMenu').data('employeeId', employeeId);
    $('#contextMenu').data('employeeCode', employeeCode);
  }

  /* #region Chức năng xóa */

  /**
   * Hiển thị tin nhắn xóa
   */
  showDeleteMessagePopup() {
    // Tắt hiển thị contextMenu
    $('#contextMenu').hide();

    let employeeCode = $('#contextMenu').data('employeeCode');
    $('#deletingEmployeeCode').text(employeeCode);
    $('#dlgDeletePopup').show();
  }

  /**
   * Tắt tin nhắn xóa
   */
  closeDeleteMessagePopup() {
    // tắt khung hiển thị deleteMessage
    $('#dlgDeletePopup').hide();
    // Xóa dữ liệu khung context
    $('#contextMenu').data('employeeId', null);
    $('#contextMenu').data('employeeCode', null);
    // Xóa dữ liệu trong dlgDeletePopup
    $('#deletingEmployeeCode').text('');
  }

  /**
   * Xóa dòng dữ liệu được chọn
   * Author: Trang Hải Long (23/11/2021)
   */
  delete() {
    let me = this;
    let employeeId = $('#contextMenu').data('employeeId');

    // Gọi đến api xóa thông tin nhân viên
    $.ajax({
      type: "DELETE",
      url: `${this.employeeApiUrl}/${employeeId}`,
      success: function (response) {
        CommonJS.toastMsgPopup($('.m-toast-delete'));
        // Load lại dữ liệu
        me.loadData();
        // Tắt contextMenu
        me.closeDeleteMessagePopup();
      }
    });
  }

  /* #endregion */

}