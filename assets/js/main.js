$(document).ready(function () {
    const menuContainer = $('#menu-container');
    const mainContent = $('#main-content');
    const searchInput = $('#search-input');
    const sidebar = $('#sidebar');
    const sidebarToggle = $('#sidebar-toggle');

    // Function to load content and set active class
    function loadContent(url, targetLink) {
        const paper = $('<div class="paper"></div>');
        mainContent.html(paper); // Create the paper container

        if (!url) {
            paper.html('<h1>Lỗi</h1><p>Không tìm thấy đường dẫn cho mục này.</p>');
            return;
        }

        paper.load(url, function (response, status, xhr) {
            if (status == "error") {
                paper.html(`<h1>Lỗi tải trang</h1><p>Không thể tải nội dung từ: ${url}</p><p>Mã lỗi: ${xhr.status} ${xhr.statusText}</p>`);
            }
        });
        
        // Set active class
        menuContainer.find('a').removeClass('active');
        if(targetLink){
            $(targetLink).addClass('active');
            
            // Open parent menus if a child is active
            $(targetLink).parents('ul').show();
            $(targetLink).parents('li').addClass('open');
            
            // Lưu menu được chọn vào localStorage
            localStorage.setItem('selectedMenuUrl', url);
        }
    }

    // Recursive function to build the menu
    function buildMenu(items, container) {
        const ul = $('<ul></ul>');
        items.forEach(item => {
            const li = $('<li></li>');
            const a = $(`<a href="#" data-url="${item.contentUrl || '#'}"></a>`);
            
            if (item.icon) {
                a.append(`<i class="bi ${item.icon} menu-icon"></i>`);
            }
            a.append(`<span>${item.name}</span>`);

            li.append(a);

            if (item.children && item.children.length > 0) {
                const subUl = buildMenu(item.children, li);
                li.append(subUl);
                
                // Add click handler for parent items
                a.on('click', function(e) {
                    e.preventDefault();
                    $(this).siblings('ul').slideToggle();
                    $(this).parent('li').toggleClass('open');
                });
            } else {
                 a.on('click', function (e) {
                    e.preventDefault();
                    loadContent(item.contentUrl, this);
                    if (window.innerWidth <= 768) {
                        sidebar.removeClass('active');
                    }
                });
            }
            ul.append(li);
        });
        container.append(ul);
        return ul;
    }

    // Fetch JSON and build menu
    $.getJSON('config/menu.json', function (data) {
        buildMenu(data, menuContainer);
        
        // Kiểm tra xem có menu được lưu trong localStorage không
        const savedMenuUrl = localStorage.getItem('selectedMenuUrl');
        let menuLoaded = false;
        
        if (savedMenuUrl) {
            // Tìm link có URL matching
            const savedLink = menuContainer.find(`a[data-url="${savedMenuUrl}"]`);
            if (savedLink.length > 0) {
                loadContent(savedMenuUrl, savedLink[0]);
                menuLoaded = true;
            }
        }
        
        // Nếu không có saved menu hoặc không tìm thấy, load menu đầu tiên
        if (!menuLoaded && data.length > 0 && data[0].contentUrl) {
            const firstLink = menuContainer.find('a').first();
            loadContent(data[0].contentUrl, firstLink[0]);
        }
    }).fail(function() {
        mainContent.html('<h1>Lỗi</h1><p>Không thể tải file menu.json. Vui lòng kiểm tra lại đường dẫn và cấu trúc file.</p>');
    });

    // Search functionality
    searchInput.on('keyup', function () {
        const searchTerm = $(this).val().toLowerCase();
        menuContainer.find('li').each(function() {
            const li = $(this);
            const text = li.children('a').text().toLowerCase();
            
            if (text.includes(searchTerm)) {
                li.show();
                // If a child matches, ensure its parents are also visible
                li.parents('ul, li').show();
            } else {
                li.hide();
            }
        });
    });

    // Sidebar toggle for mobile
    sidebarToggle.on('click', function () {
        sidebar.toggleClass('active');
    });

    // Hide sidebar if user clicks outside of it on mobile
    $(document).on('click', function(event) {
        if (window.innerWidth <= 768) {
            if (!$(event.target).closest('#sidebar, #sidebar-toggle').length) {
                if (sidebar.hasClass('active')) {
                    sidebar.removeClass('active');
                }
            }
        }
    });
});
