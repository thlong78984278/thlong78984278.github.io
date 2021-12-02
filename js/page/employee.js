$(document).ready(function () {
  employeePage = new EmployeePage();
});

class EmployeePage {
  FormMode = null;
  currentlySelectedEmployee = null;
  apiUrl = 'http://amis.manhnv.net/api/v1';
  employeeApiUrl = `${this.apiUrl}/Employees`;
  departmentApiUrl = `${this.apiUrl}/Departments`;
  positionApiUrl = `${this.apiUrl}/Positions`;
  constructor() {
    // Gán các sự kiện
    this.initEvents();
    // load dữ liệu bảng
    this.loadData();
  }

  initEvents() {
    $('#btnRefresh').click(this.loadData.bind(this));
    $('#btnClosePopup').click(this.closePopup);
    $('#btnCancelPopup').click(this.closePopup);
    // Hiển thị form thêm mới nhân viên
    $('#btnAddEmployee').click(this.addEmployee.bind(this));
  }

  /* #region Nạp dữ liệu */

  /**
   * Lấy dữ liệu từ database xây dựng các dòng hiển thị trên bảng
   * Author: Trang Hải Long (21/11/2021)
   */
  loadData() {
    // Làm sạch bảng
    $("#tblEmployee tbody").empty();

    // Lấy dữ liệu
    let employees = [];

    // Hiển thị màn hình chờ
    $('.f-loading').show();
    //  Gọi lên Api thực hiện lấy dữ liệu -> Sử dụng ajax
    $.ajax({
      type: "GET",
      url: this.employeeApiUrl,
      async: false,
      success: function (response) {
        employees = response;
      },
      error: function (res) {
        alert("có lỗi xảy ra");
      }
    });

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
                  <td class="text-align-left">${employeeCode}</td>
                  <td class="text-align-left">${employeeName}</td>
                  <td class="text-align-left">${genderName}</td>
                  <td class="text-align-center">${dateOfBirth}</td>
                  <td class="text-align-left">${identityNumber}</td>
                  <td class="text-align-left">${positionName}</td>
                  <td class="text-align-left">${departmentName}</td>
                  <td class="text-align-left">${bankAccountNumber}</td>
                  <td class="text-align-left">${bankName}</td>
                  <td class="text-align-left">${bankBranchName}</td>
                  <td class="text-align-center">
                    <div class="f-utility-dropdown">
                      <div class="f-dropdown-text text-align-center">Sửa</div>
                      <div class="dropdown-btn">
                        <div class="f-icon icon-16 f-icon-arrow-up--blue"></div>
                      </div>
                    </div>
                  </td>
                </tr>
                `;
      $("#tblEmployee tbody").prepend(tr);

      // Thêm data employeeId cho từng dòng dữ liệu nhân viên
      $(`tbody tr:nth-child(1)`).data('value', employeeId);
    });
    

    // Ẩn màn hình chờ sau khi đã kết thúc nạp dữ liệu
    $('.f-loading').hide();

  }

  /* #endregion */

  /**
   * Tắt dialog
   * Author: Trang Hải Long (23/11/2021)
   */
  closePopup() {
    $('#dlgPopup').hide();
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
    $('input').val(null)
    $('.f-custom-combobox .f-combobox-item').removeClass('combobox-item-active');
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
    // FormMode: Edit
    this.FormMode = Enum.FormMode.Edit;
    CommonJS.clearSelection();
    // Hiển thị Form thông tin nhân viên
    $('#dlgPopup').show();
    let employeeId = $(event.currentTarget).data('value');
    // Xóa dữ liệu đã nhập trước đó
    $('input').val(null)

    // Lấy dữ liệu nhân viên theo mã nhân viên
    $.ajax({
      type: "GET",
      url: `${this.employeeApiUrl}/${employeeId}`,
      success: function (employee) {
        // Bind dữ liệu input
        let inputs = $('.m-dialog-content-right input[fieldName]');
        for (const input of inputs) {
          // Lấy ra fieldName của input hiện tại và thông tin của nhân viên tương ứng với fieldName đó
          let fieldName = $(input).attr('fieldName');
          let value = employee[fieldName];
          // debugger
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
        $('#cbxGender input').val(employee.GenderName);
        $('#cbxGender').data('value', employee.Gender);

        $('#cbxWorkStatus').data('value', employee.WorkStatus);
        switch (employee.WorkStatus) {
          case 0:
            $('#cbxWorkStatus input').val('Đang thử việc');
            break;
          case 1:
            $('#cbxWorkStatus input').val('Đã nghỉ hưu');
            break;
          case 2:
            $('#cbxWorkStatus input').val('Đã nghỉ việc');
            break;
          default:
            break;
        }

        $('#cbxPosition input').val(employee.PositionName);
        $('#cbxPosition').data('value', employee.PositionId);
        $('#cbxDepartment input').val(employee.DepartmentName);
        $('#cbxDepartment').data('value', employee.DepartmentId);
      }
    });
  }

  /**
   * Cất dữ liệu người dùng nhập lên kho
   * Author: Trang Hải Long (23/11/2021)
   */
  saveData(event) {
    let me = this;
    let employeeId = me.currentlySelectedEmployee;
    // Tạo employee object lưu dữ liệu Form
    let employee = {};

    // Lấy dữ liệu từ input Form:
    let inputs = $('.m-dialog-content-right input[fieldName]');
    for (const input of inputs) {
      // Lấy ra fieldName của input hiện tại và thông tin của nhân viên tương ứng với fieldName đó
      let fieldName = $(input).attr('fieldName');
      let value = input.value;
      if (value) {
        employee[fieldName] = value;
      } else
        employee[fieldName] = null;
    }

    // Lấy dữ liệu từ combobox Form:
    employee['Gender'] = $('#cbxGender').data('value');
    employee['DepartmentId'] = $('#cbxDepartment').data('value');
    employee['PositionId'] = $('#cbxPosition').data('value');
    employee['WorkStatus'] = $('#cbxWorkStatus').data('value');

    // Gọi api cất dữ liệu
    if (this.FormMode == Enum.FormMode.Add) {
      $.ajax({
        type: "POST",
        url: this.employeeApiUrl,
        data: JSON.stringify(employee),
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
          // Toast message: Thêm mới thành công
          CommonJS.toastMsgPopup($('.m-toast-add'));
          // load lại dữ liệu
          me.loadData();
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
          // Toast message: Sửa thành công
          CommonJS.toastMsgPopup($('.m-toast-update'));
          // load lại dữ liệu
          me.loadData();
        }
      });
    }

    $('#dlgPopup').hide();
  }

  /**
   * Xóa dòng dữ liệu được chọn
   * Author: Trang Hải Long (23/11/2021)
   */
  delete() {
    let me = this;
    let employeeId = this.currentlySelectedEmployee;

    $.ajax({
      type: "DELETE",
      url: `${this.employeeApiUrl}/${employeeId}`,
      success: function (response) {
        CommonJS.toastMsgPopup($('.m-toast-delete'));
        // Load lại dữ liệu
        me.loadData();
      }
    });
  }

}