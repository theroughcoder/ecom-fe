import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from './LoadingBox';

const DEFAULT_IMAGE = 'https://s3-ecom-buckett.s3.ap-south-1.amazonaws.com/photo/default/Default-product-image.jfif';

const emptyForm = {
  name: '',
  slug: '',
  price: '',
  image: '',
  category: '',
  countInStock: '',
  description: '',
  rating: '',
  numReviews: '',
};

export default function ProductFormModal({ show, onHide, product, onSaved }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const isEdit = Boolean(product);

  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  useEffect(() => {
    if (show) {
      setForm(
        product
          ? {
              name: product.name || '',
              slug: product.slug || '',
              price: product.price ?? '',
              image: product.image || '',
              category: product.category || '',
              countInStock: product.countInStock ?? '',
              description: product.description || '',
              rating: product.rating ?? '',
              numReviews: product.numReviews ?? '',
            }
          : emptyForm
      );
      setImageFile(null);
      setImagePreview('');
    }
  }, [show, product]);

  useEffect(() => {
    if (!imageFile) return;
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const selectFileHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoadingSave(true);
    try {
      let image = form.image;
      if (imageFile) {
        const bodyFormData = new FormData();
        bodyFormData.append('file', imageFile);
        bodyFormData.append('category', form.category);
        const { data } = await axios.post(
          `${process.env.REACT_APP_PRODUCT_URL}/api/v1/s3/upload-image`,
          bodyFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        image = data.filePath;
      }

      const payload = {
        ...form,
        image,
        price: Number(form.price) || 0,
        countInStock: Number(form.countInStock) || 0,
        rating: Number(form.rating) || 0,
        numReviews: Number(form.numReviews) || 0,
      };

      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_PRODUCT_URL}/api/products/${product.id}`,
          { id: product.id, ...payload },
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        toast.success('Product updated successfully');
      } else {
        await axios.post(
          `${process.env.REACT_APP_PRODUCT_URL}/api/products`,
          payload,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        toast.success('Product created successfully');
      }
      onSaved();
      onHide();
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Form onSubmit={submitHandler}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Product' : 'Create Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={4} className="text-center mb-4 mb-md-0">
              <img
                src={imagePreview || form.image || DEFAULT_IMAGE}
                alt="Product"
                className="rounded border mb-3"
                style={{
                  width: '100%',
                  height: 220,
                  objectFit: 'cover',
                  background: '#f6f6f6',
                }}
              />
              <Form.Group controlId="imageFile" className="mb-2">
                <Form.Label className="w-100 mb-0">
                  <span className="btn btn-outline-secondary btn-sm w-100">
                    {imageFile ? 'Change Photo' : 'Upload Photo'}
                  </span>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={selectFileHandler}
                    className="d-none"
                    disabled={loadingSave}
                  />
                </Form.Label>
              </Form.Group>
            </Col>

            <Col md={8}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      value={form.name}
                      onChange={handleChange('name')}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="slug">
                    <Form.Label>Slug</Form.Label>
                    <Form.Control
                      value={form.slug}
                      onChange={handleChange('slug')}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="price">
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={handleChange('price')}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="category">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      value={form.category}
                      onChange={handleChange('category')}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="countInStock">
                    <Form.Label>Count In Stock</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={form.countInStock}
                      onChange={handleChange('countInStock')}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="rating">
                    <Form.Label>Rating</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={form.rating}
                      onChange={handleChange('rating')}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="numReviews">
                    <Form.Label># Reviews</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={form.numReviews}
                      onChange={handleChange('numReviews')}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-2" controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.description}
                  onChange={handleChange('description')}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {loadingSave && <LoadingBox></LoadingBox>}
          <Button variant="light" onClick={onHide} disabled={loadingSave}>
            Cancel
          </Button>
          <Button type="submit" disabled={loadingSave}>
            {loadingSave
              ? imageFile
                ? 'Uploading & Saving...'
                : 'Saving...'
              : isEdit
              ? 'Update'
              : 'Create'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
