import './SectionTwo.css'

function SectionTwo({ imageOne, imageOneText,
                      imageTwo, imageTwoText}) {
    return (
    <>
        <div id="section-two">
            <div id="section-two-left">
                <img src={imageOne} id="image-one" />
                    <p id="image-one-text">{imageOneText}</p>
            </div>

            <div id="section-two-right">
                <img src={imageTwo} id="image-two" />
                    <p id="image-two-text">{imageTwoText}</p>
            </div>
        </div>
    </>
  );
}

export default SectionTwo;