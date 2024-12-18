import PropTypes from 'prop-types';

const Label = ({ multifieldData, type, onClick }) => {
    console.log(multifieldData, 'is multiFieldData');
    return multifieldData
        .sort((a, b) => multifieldData[a].localeCompare(multifieldData[b]))
        .map(item => {
            if (type === 'button') {
                return <button
                    key={item}
                    onClick={onClick}>{item}</button>
            }
            return <input
                key={item + '-key'}
                checked={(multifieldData || []).includes(parseInt(item))}
                value={item}
                id={item + '-key'} />

        })
}

Label.propTypes = {
    multifieldData: PropTypes.array,
    type: PropTypes.oneOf(['button', 'div']).isRequired,
    onClick: PropTypes.func,
    name: PropTypes.node,
    className: PropTypes.string,
};

export default Label