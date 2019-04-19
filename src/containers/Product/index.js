import React from 'react';
import { View, Text, Button, Picker, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { BRAND_NAME, BORDER_COLOR } from '../../constants';
import { PRODUCT, CART } from '../../reducers/types';
import { getProductMedia, getConfigurableProductOptions, uiProductUpdate, addToCart } from '../../actions';
import { Spinner } from '../../components/common';
import ProductMedia from '../../components/catalog/ProductMedia';

class Product extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('title', BRAND_NAME),
  })

  constructor(props) {
    super(props);
    this.renderOptions = this.renderOptions.bind(this);
    this.renderPickerOptions = this.renderPickerOptions.bind(this);
    this.onPressAddToCart = this.onPressAddToCart.bind(this);
  }

  componentDidMount() {
    const {
      product,
      medias,
      getProductMedia: _getProductMedia,
      getConfigurableProductOptions: _getConfigurableProductOptions,
    } = this.props;

    if (product.type_id === 'configurable') {
      _getConfigurableProductOptions(product.sku);
    }

    if (!medias || !medias[product.sku]) {
      _getProductMedia(product.sku);
    }
  }

  onPressAddToCart() {
    const { product, selectedOptions, cartQuoteId, addToCart: _addToCart } = this.props;
    const qty = 1;
    const cartItem = { sku: product.sku, qty, quote_id: cartQuoteId };
    if (product.type_id === 'simple') {
      _addToCart(cartItem);
    } else if (product.type_id === 'configurable') {
      cartItem.product_option = {};
      cartItem.product_option.extension_attributes = {};
      cartItem.product_option.extension_attributes.configurable_item_options = [];
      Object.keys(selectedOptions).map((key, index) => {
        cartItem.product_option.extension_attributes.configurable_item_options.push({
          option_id: key,
          option_value: selectedOptions[key],
        });
      });
      _addToCart(cartItem);
    } else {
      console.log('Implement functionality for other types of products');
    }
  }

  renderImage = (sku, medias, loading, error) => (
    <ProductMedia media={medias[sku]} loading={loading} error={error} />
  )

  getDescription = (customAttributes) => {
    for (let i = 0; i < customAttributes.length; i++) {
      const customAttribute = customAttributes[i];
      if (customAttribute.attribute_code === 'description') return customAttribute.value;
    }
    return 'Lorem ipseum';
  }

  renderPickerOptions(values) {
    return values.map(({ label, value }) => <Picker.Item label={label} value={String(value)} />);
  }

  // TODO: extract this into own component
  renderOptions() {
    const { product, confOptionsLoading, confOptionsError, attributes, selectedOptions } = this.props;
    const { options } = product;

    if (confOptionsLoading) {
      return <Spinner size="small" />;
    }

    if (confOptionsError) {
      // TODO: Disable add to cart and buy now button
      return <Text>{confOptionsError}</Text>
    }

    if (options && Array.isArray(options)) {
      return options.sort((first, second) => first.position - second.position)
        .map((option) => {
          if (!attributes[option.attribute_id]) {
            return <Spinner size="small" />
          }

          const optionIds = option.values.map(value => String(value.value_index));
          const values = attributes[option.attribute_id].options.filter(({ value }) => optionIds.includes(value));
          return (
            <View>
              <Text>Select {option.label}</Text>
              <Picker
                selectedValue={selectedOptions[option.attribute_id]}
                style={{ height: 50, flex: 1 }}
                onValueChange={(itemValue, itemIndex) => {
                  this.props.uiProductUpdate({ [option.attribute_id]: itemValue });
                }}
              >
                {this.renderPickerOptions(values)}
              </Picker>
            </View >
          );
        });
    }
    return null;
  }

  renderActionButtons() {
    const { addToCartLoading, addToCartError } = this.props;
    let addtoCartButton = <Button style={{ flex: 1 }} title="Add to cart" onPress={this.onPressAddToCart} />;
    if (addToCartLoading) {
      addtoCartButton = <Spinner />;
    }
    let addToCartErrorMessage = null;
    if (addToCartError) {
      addToCartErrorMessage = <Text style={{ fontSize: 14, color: 'red' }}>{addToCartError}</Text>;
    }
    return (
      <View>
        {addToCartErrorMessage}
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 8 }}>
          <Button style={{ flex: 1, marginRight: 8 }} title="Add to Wishlist" />
          {addtoCartButton}
        </View>
      </View>
    );
  }

  renderContent() {
    const { product, medias, mediaLoading, mediaError } = this.props;
    if (!product) {
      return <Spinner />;
    }

    return (
      <ScrollView>
        <View>
          {/* <Text>{product.name}</Text> */}
          {this.renderImage(product.sku, medias, mediaLoading, mediaError)}
          <View style={{}}>
            <Text>{this.getDescription(product.custom_attributes)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>price </Text>
            <Text style={{ fontSize: 18, color: 'green' }}>${product.price}</Text>
          </View>
          {this.renderOptions()}
          {this.renderActionButtons()}
        </View>
      </ScrollView>
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.renderContent()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const {
    medias,
    mediaLoading,
    confOptionsLoading,
    confOptionsError,
    mediaError,
    addToCartLoading,
    addToCartError,
    attributes,
    selectedOptions,
    current: product,
  } = state[PRODUCT];
  const { cart } = state[CART];
  const cartQuoteId = cart.id;
  return {
    product,
    attributes,
    medias,
    mediaLoading,
    mediaError,
    addToCartLoading,
    addToCartError,
    confOptionsLoading,
    confOptionsError,
    selectedOptions,
    cartQuoteId,
  };
};

export default connect(mapStateToProps, {
  getProductMedia,
  getConfigurableProductOptions,
  uiProductUpdate,
  addToCart,
})(Product);
