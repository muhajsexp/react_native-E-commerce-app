import React, { useEffect, useContext } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getCartItemProduct, removeItemFromCart } from '../../../../store/actions';
import { getProductThumbnailFromAttribute } from '../../../../utils';
import { Card, Image, Text } from '../../..';
import { ThemeContext } from '../../../../theme';
import { translate } from '../../../../i18n';

// NOTE: Is it better to create a wapper around CartListItem and extract state in it?
// It is in organisms folder because it is state aware
const CartListItem = ({
  item,
  product: productDetail,
  currencySymbol,
  getCartItemProduct: _getCartItemProduct,
  removeItemFromCart: _removeItemFromCart,
}) => {
  const theme = useContext(ThemeContext);

  useEffect(() => {
    // componentDidMount
    if (!item.thumbnail && !productDetail) {
      _getCartItemProduct(item.sku);
    }
  }, []);

  const onPressRemoveItem = () => {
    Alert.alert(
      translate('cartScreen.removeItemDialogTitle'),
      `${translate('cartScreen.removeItemDialogMessage')}: ${item.name}`,
      [
        { text: translate('common.cancel'), onPress: () => console.log('Cancel pressed'), style: 'cancel' },
        { text: translate('common.ok'), onPress: () => _removeItemFromCart(item.item_id) },
      ],
      { cancelable: true }
    );
  };

  const getImageUrl = () => (productDetail ? getProductThumbnailFromAttribute(productDetail) : '');

  return (
    <Card style={styles.mainContainer(theme)}>
      <Image
        style={styles.image(theme)}
        resizeMode="contain"
        source={{ uri: getImageUrl() }}
      />
      <View style={styles.infoContainer}>
        <Text>{item.name}</Text>
        <Text>{`${translate('common.price')}: ${currencySymbol}${productDetail ? productDetail.price : item.price}`}</Text>
        <Text>{`${translate('common.quantity')} : ${item.qty}`}</Text>
      </View>
      <Icon name="close" size={30} color="#000" onPress={onPressRemoveItem} />
    </Card>
  );
};

const styles = StyleSheet.create({
  mainContainer: theme => ({
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: theme.spacing.small,
    marginRight: theme.spacing.small,
    marginBottom: theme.spacing.small,
  }),
  image: theme => ({
    flex: 1,
    left: 0,
    height: theme.dimens.cartListImageHeight,
    width: theme.dimens.cartListImageWidth,
  }),
  infoContainer: {
    flex: 1,
  }
});

CartListItem.propTypes = {
  item: PropTypes.object.isRequired,
  product: PropTypes.object,
  currencySymbol: PropTypes.string.isRequired,
  getCartItemProduct: PropTypes.func.isRequired,
  removeItemFromCart: PropTypes.func.isRequired,
};

CartListItem.defaultProps = {
  product: undefined,
};

const mapStateToProps = ({ cart }, { item }) => {
  const products = cart.products || {};
  const product = products[item.sku];
  return {
    product,
  };
};

export default connect(mapStateToProps, {
  getCartItemProduct,
  removeItemFromCart
})(CartListItem);
