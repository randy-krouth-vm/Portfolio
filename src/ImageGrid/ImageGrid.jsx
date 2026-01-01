import './ImageGrid.css'

function ImageGrid({ imageOne, imageOneText,
                      imageTwo, imageTwoText}) {
    return (
    <>
        <div id="image-grid">
            <div id="image-grid-left">
                <img src={imageOne} id="image-one" alt="Image One Placeholder"/>
                    <p id="image-one-text">{imageOneText}</p>
            </div>

            <div id="image-grid-right">
                <img src={imageTwo} id="image-two" alt="Image Two Placeholder"/>
                    <p id="image-two-text">{imageTwoText}</p>
            </div>
        </div>
    </>
  );
}

export default ImageGrid;