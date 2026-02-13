import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  title,
  subtitle,
  header,
  footer,
  className = '',
  hover = false,
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5'
  };

  return (
    <div
      className={`card-modern ${hover ? 'card-hover-modern' : ''} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {(title || subtitle || header) && (
        <div className="card-header-modern">
          {header || (
            <>
              {title && <h5 className="card-title-modern">{title}</h5>}
              {subtitle && <p className="card-subtitle-modern">{subtitle}</p>}
            </>
          )}
        </div>
      )}
      
      <div className="card-body-modern">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer-modern">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  header: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  hover: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg'])
};

export default Card;

