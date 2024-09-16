const imageList = imagesData;

function createImageEl(images, nColumns) {
    const container = document.getElementById('images');
    container.innerHTML = '';

    for (let i = 0; i < nColumns; i++) {
        const column = document.createElement('div');
        column.classList.add('column');
        container.appendChild(column);
    }

    images.forEach((image, index) => {
        const columnIndex = index % nColumns;
        const column = container.children[columnIndex];

        const box = document.createElement('div');
        box.classList.add('box');
        
        const title = document.createElement('h2');
        title.id = `title-${image.title}`;
        title.hidden = true;
        title.textContent = image.title;
        box.appendChild(title);

        const img = document.createElement('img');
        img.src = '../../media/images/' + image.title;
        img.id = `img-${index + 1}`;
        img.onclick = () => displayImageInfos(image.title);
        box.appendChild(img);

        const tagsContainer = document.createElement('div');
        tagsContainer.classList.add('tags-container');
        tagsContainer.id = `tags-${image.title}`;
        tagsContainer.hidden = true;
        image.tags.forEach(tag => {
            const t = document.createElement('h3');
            t.textContent = tag;
            tagsContainer.appendChild(t);
        });
        box.appendChild(tagsContainer);

        column.appendChild(box);

    });
}

function getNumberOfColumns() {
    if (window.matchMedia('(max-width: 600px)').matches) {
        return 2;
    } else if (window.matchMedia('(max-width: 900px)').matches) {
        return 3;
    } else if (window.matchMedia('(max-width: 1200px)').matches) {
        return 4;
    } else {
        return 5;
    }
}

function updateColumns() {
    const nColumns = getNumberOfColumns();
    createImageEl(imageList, nColumns);
}

window.addEventListener('resize', updateColumns);

updateColumns();